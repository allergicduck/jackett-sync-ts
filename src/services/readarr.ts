import { Service } from './service';
import { Indexer } from '../models/indexer';
import { Config } from '../config';
import { LidarrEntry, LidarrFieldName } from '../interfaces/LidarrEntry';
import { JackettIndexer } from '../models/jackettIndexer';
import { ReadarrEntry, ReadarrFieldName } from '../interfaces/ReadarrEntry';

export class Readarr extends Service {
    constructor() {
        const c = Config.readarr;
        super('Readarr', '/api/v1', c.url, c.apiKey, c.categories, c.seeds);
    }

    protected mapToIndexer(entry: ReadarrEntry): Indexer {
        console.log(entry);

        const indexer = new Indexer(
            undefined,
            entry.id,
            entry.name,
            entry.protocol,
            entry.fields.find((field) => field.name == ReadarrFieldName.categories)!.value,
            entry.fields.find((field) => field.name == ReadarrFieldName.minimumSeeders)!.value,
            entry.fields.find((field) => field.name == ReadarrFieldName.baseUrl)!.value,
            entry.fields.find((field) => field.name == ReadarrFieldName.apiKey)!.value,
        );

        let match = indexer.url.match(this.indexerRegex);
        if (match && match.groups) {
            indexer.id = match.groups.id;
        }

        return indexer;
    }

    protected generateDefaultBody(indexer: JackettIndexer): ReadarrEntry {
        const supportedCategories = this.categories.filter(id => indexer.categories.includes(id));

        this.indexerSpecificConfiguration(indexer, supportedCategories);

        return {
            priority: 0,
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