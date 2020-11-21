import { Service } from './service';
import { Indexer } from '../models/indexer';
import { Config } from '../config';
import { LidarrEntry, LidarrFieldName } from '../interfaces/LidarrEntry';
import { JackettIndexer } from '../models/jackettIndexer';
import { ApiRoutes } from '../models/apiRoutes';
import { getIdFromIndexerUrl } from '../helper';

export class Lidarr extends Service {
    apiRoutes: ApiRoutes;

    constructor() {
        const c = Config.lidarr;
        super('Lidarr', c.categories, c.seeds);
        this.checkUrlAndApiKey(c.url, c.apiKey);

        this.apiRoutes = new ApiRoutes(c.url!, '/api/v1', c.apiKey!);
    }

    protected mapToIndexer(entry: LidarrEntry): Indexer {
        const indexer = new Indexer(
            undefined,
            entry.id,
            entry.name,
            entry.protocol,
            entry.fields.find((field) => field.name == LidarrFieldName.categories)!.value,
            entry.fields.find((field) => field.name == LidarrFieldName.minimumSeeders)!.value,
            entry.fields.find((field) => field.name == LidarrFieldName.baseUrl)!.value,
            entry.fields.find((field) => field.name == LidarrFieldName.apiKey)!.value,
        );

        indexer.id = getIdFromIndexerUrl(indexer.url);

        return indexer;
    }

    protected generateDefaultBody(indexer: JackettIndexer): LidarrEntry {
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
                { name: LidarrFieldName.baseUrl, value: indexer.url },
                { name: LidarrFieldName.apiPath, value: '/api' },
                { name: LidarrFieldName.apiKey, value: indexer.key },
                { name: LidarrFieldName.categories, value: supportedCategories },
                { name: LidarrFieldName.earlyReleaseLimit },
                { name: LidarrFieldName.additionalParameters },
                { name: LidarrFieldName.minimumSeeders, value: this.seeds },
                { name: LidarrFieldName.seedRatio },
                { name: LidarrFieldName.seedTime },
                { name: LidarrFieldName.discographySeedTime },
            ],
            implementationName: 'Torznab',
            implementation: 'Torznab',
            configContract: 'TorznabSettings',
            tags: [],
            id: undefined,
        };
    }
}