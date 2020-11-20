import { Service } from './service';
import axios, { AxiosResponse } from 'axios';
import { Indexer } from '../models/indexer';
import { Config } from '../config';
import { LidarrEntry, LidarrFieldName } from '../interfaces/LidarrEntry';

export class Lidarr extends Service {
    constructor() {
        const c = Config.lidarr;
        super('Lidarr', c.url, c.apiKey, c.categories, c.seeds);
        this.systemStatusUrl = `${this.url}/api/v1/system/status?apikey=${this.key}`
    }

    async getIndexers(): Promise<void> {
        const reqUrl = `${this.url}/api/v1/indexer?apikey=${this.key}`;
        this.indexers = await this.handleIndexersRequest(reqUrl);
    }

    protected add(indexer) {
        const reqUrl = `${this.url}/api/v1/indexer?apikey=${this.key}`;
        const body = this.generateDefaultBody(indexer);

        return axios.post(reqUrl, body);
    }

    protected update(appId: number, indexer: Indexer): Promise<AxiosResponse> {
        const reqUrl = `${this.url}/api/v1/indexer/${appId}?apikey=${this.key}`;
        const body = this.generateDefaultBody(indexer);
        body.id = appId;

        return axios.put(reqUrl, body);
    }

    protected mapToIndexer(entry: LidarrEntry): Indexer {
        const indexer = new Indexer(
            '',
            entry.id,
            entry.name,
            entry.protocol,
            entry.fields.find((field) => field.name == LidarrFieldName.categories).value,
            entry.fields.find((field) => field.name == LidarrFieldName.minimumSeeders).value,
            entry.fields.find((field) => field.name == LidarrFieldName.baseUrl).value,
            entry.fields.find((field) => field.name == LidarrFieldName.apiKey).value,
        );

        let match = indexer.url.match(this.indexerRegex);
        if (match) {
            indexer.id = match.groups.id;
        }

        return indexer;
    }

    protected generateDefaultBody(indexer: Indexer): LidarrEntry {
        const supportedCategories = this.categories.filter(id => indexer.categories.includes(id));

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