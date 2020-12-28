import { Service } from './service';
import { Indexer } from '../models/indexer';
import { RadarrEntry, RadarrFieldName } from '../interfaces/RadarrEntry';
import { Config } from '../config';
import { getIdFromIndexerUrl } from '../helper';
import { JackettIndexer } from '../models/jackettIndexer';
import { ApiRoutes } from '../models/apiRoutes';
import { Services } from '../models/indexSpecificRule';

export class Radarr extends Service {
    apiRoutes: ApiRoutes;

    constructor() {
        const c = Config.radarr;
        super(Services.RADARR, c.categories, c.seeds);
        this.checkUrlAndApiKey(c.url, c.apiKey);

        this.apiRoutes = new ApiRoutes(c.url!, '/api', c.apiKey!);
    }

    protected mapToIndexer(entry: RadarrEntry) {
        const indexer = new Indexer(
            '',
            entry.id,
            entry.name,
            entry.protocol,
            entry.fields.find((field) => field.name == RadarrFieldName.categories)!.value,
            entry.fields.find((field) => field.name == RadarrFieldName.minimumSeeders)!.value,
            entry.fields.find((field) => field.name == RadarrFieldName.baseUrl)!.value,
            entry.fields.find((field) => field.name == RadarrFieldName.apiKey)?.value,
            [],
        );

        indexer.id = getIdFromIndexerUrl(indexer.url);

        return indexer;
    }

    protected generateDefaultBody(indexer: JackettIndexer): RadarrEntry {
        const supportedCategories = this.categories.filter(id => indexer.categories.includes(id));

        this.indexerSpecificConfiguration(indexer, supportedCategories, []);

        return {
            enableRss: true,
            enableSearch: true,
            supportsRss: true,
            supportsSearch: true,
            protocol: indexer.protocol,
            name: indexer.title,
            fields: [
                { name: RadarrFieldName.baseUrl, value: indexer.url },
                { name: RadarrFieldName.apiPath, value: '/api' },
                { name: RadarrFieldName.multiLanguages, value: '' },
                { name: RadarrFieldName.apiKey, value: indexer.key },
                { name: RadarrFieldName.categories, value: supportedCategories },
                { name: RadarrFieldName.additionalParameters },
                { name: RadarrFieldName.removeYear, value: false },
                { name: RadarrFieldName.minimumSeeders, value: this.seeds },
                { name: RadarrFieldName.seedRatio },
                { name: RadarrFieldName.seedTime },
                { name: RadarrFieldName.requiredFlags, value: '' },
            ],
            implementationName: 'Torznab',
            implementation: 'Torznab',
            configContract: 'TorznabSettings',
            id: undefined,
        };
    }
}