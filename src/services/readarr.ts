import { Service } from './service';
import { Indexer } from '../models/indexer';
import { Config } from '../config';
import { JackettIndexer } from '../models/jackettIndexer';
import { ReadarrEntry, ReadarrFieldName } from '../interfaces/ReadarrEntry';
import { ApiRoutes } from '../models/apiRoutes';
import { getIdFromIndexerUrl } from '../helper';
import { Services } from '../models/indexSpecificRule';

export class Readarr extends Service {
    apiRoutes: ApiRoutes;

    constructor() {
        const c = Config.readarr;
        super(Services.READARR, c.categories, c.seeds);
        this.checkUrlAndApiKey(c.url, c.apiKey);

        this.apiRoutes = new ApiRoutes(c.url!, '/api/v1', c.apiKey!);
    }

    protected mapToIndexer(entry: ReadarrEntry): Indexer {
        const indexer = new Indexer(
            undefined,
            entry.id,
            entry.name,
            entry.protocol,
            entry.fields.find((field) => field.name == ReadarrFieldName.categories)!.value,
            entry.fields.find((field) => field.name == ReadarrFieldName.minimumSeeders)!.value,
            entry.fields.find((field) => field.name == ReadarrFieldName.baseUrl)!.value,
            entry.fields.find((field) => field.name == ReadarrFieldName.apiKey)?.value,
            []
        );

        indexer.id = getIdFromIndexerUrl(indexer.url);

        return indexer;
    }

    protected generateDefaultBody(indexer: JackettIndexer): ReadarrEntry {
        const supportedCategories = this.categories.filter(id => indexer.categories.includes(id));

        this.indexerSpecificConfiguration(indexer, supportedCategories, []);

        return {
            priority: 25,
            enableRss: true,
            enableAutomaticSearch: true,
            enableInteractiveSearch: true,
            supportsRss: true,
            supportsSearch: true,
            protocol: indexer.protocol,
            name: indexer.title,
            fields: [
                { name: ReadarrFieldName.baseUrl, value: indexer.url },
                { name: ReadarrFieldName.apiPath, value: '/api' },
                { name: ReadarrFieldName.apiKey, value: indexer.key },
                { name: ReadarrFieldName.categories, value: supportedCategories },
                { name: ReadarrFieldName.earlyReleaseLimit },
                { name: ReadarrFieldName.additionalParameters },
                { name: ReadarrFieldName.minimumSeeders, value: this.seeds },
                { name: ReadarrFieldName.seedTime },
                { name: ReadarrFieldName.seedRatio },
                { name: ReadarrFieldName.discographySeedTime },
            ],
            implementationName: 'Torznab',
            implementation: 'Torznab',
            configContract: 'TorznabSettings',
            tags: [],
            id: undefined
        };
    }
}