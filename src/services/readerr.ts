import { Service } from './service';
import { Indexer } from '../models/indexer';
import { Config } from '../config';
import { LidarrEntry, LidarrFieldName } from '../interfaces/LidarrEntry';
import { JackettIndexer } from '../models/jackettIndexer';
import { ReaderrEntry, ReaderrFieldName } from '../interfaces/ReaderrEntry';

export class Readerr extends Service {
    constructor() {
        const c = Config.readerr;
        super('Readerr', '/api/v1', c.url, c.apiKey, c.categories, c.seeds);
    }

    protected mapToIndexer(entry: ReaderrEntry): Indexer {
        console.log(entry);

        const indexer = new Indexer(
            undefined,
            entry.id,
            entry.name,
            entry.protocol,
            entry.fields.find((field) => field.name == ReaderrFieldName.categories)!.value,
            entry.fields.find((field) => field.name == ReaderrFieldName.minimumSeeders)!.value,
            entry.fields.find((field) => field.name == ReaderrFieldName.baseUrl)!.value,
            entry.fields.find((field) => field.name == ReaderrFieldName.apiKey)!.value,
        );

        let match = indexer.url.match(this.indexerRegex);
        if (match && match.groups) {
            indexer.id = match.groups.id;
        }

        return indexer;
    }

    protected generateDefaultBody(indexer: JackettIndexer): ReaderrEntry {
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
                { name: ReaderrFieldName.baseUrl, value: indexer.url },
                { name: ReaderrFieldName.apiPath, value: '/api' },
                { name: ReaderrFieldName.apiKey, value: indexer.key },
                { name: ReaderrFieldName.categories, value: supportedCategories },
                { name: ReaderrFieldName.earlyReleaseLimit },
                { name: ReaderrFieldName.additionalParameters },
                { name: ReaderrFieldName.minimumSeeders, value: this.seeds },
                { name: ReaderrFieldName.seedTime },
                { name: ReaderrFieldName.seedRatio },
                { name: ReaderrFieldName.discographySeedTime },
            ],
            implementationName: 'Torznab',
            implementation: 'Torznab',
            configContract: 'TorznabSettings',
            tags: [],
            id: undefined
        };
    }
}