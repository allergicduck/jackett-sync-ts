import { Service } from './service';
import axios, { AxiosResponse } from 'axios';
import { Indexer } from '../models/indexer';
import { SonarrFieldName, SonarrEntry } from '../interfaces/SonarrEntry';
import { Config } from '../Config';

export class Sonarr extends Service {
    animeCategories: number[];

    constructor() {
        const c = Config.sonarr;
        super('Sonarr', c.url, c.apiKey, c.categories, c.seeds);
        this.animeCategories = c.animeCategories;
    }

    async getIndexers(): Promise<void> {
        const reqUrl = `${this.url}/api/v3/indexer?apikey=${this.key}`;

        this.indexers = await this.handleIndexersRequest(reqUrl);
    }

    async add(indexer: Indexer): Promise<AxiosResponse> {
        const reqUrl = `${this.url}/api/v3/indexer?apikey=${this.key}`;
        const body = this.generateDefaultBody(indexer);

        return axios.post(reqUrl, body);
    }

    async update(appId: number, indexer: Indexer): Promise<AxiosResponse> {
        const reqUrl = `${this.url}/api/v3/indexer/${appId}?apikey=${this.key}`;
        const body = this.generateDefaultBody(indexer);
        body.id = appId;

        return axios.put(reqUrl, body);
    }

    shouldAdd(indexer: Indexer) {
        return indexer.categories.some(category => this.categories.includes(category))
            || indexer.categories.some(category => this.animeCategories.includes(category));
    }

    containsAllWantedCategories(current: Indexer, indexer: Indexer): boolean {
        const availableCategories = this.categories.filter(id => indexer.categories.includes(id));
        const availableAnimeCategories = this.animeCategories.filter(id => indexer.categories.includes(id));
        return Service.arrayEquals(current.categories, availableCategories) && Service.arrayEquals(current.animeCategories, availableAnimeCategories);
    }

    protected mapToIndexer(entry: SonarrEntry): Indexer {
        const indexer = new Indexer(
            '',
            entry.id,
            entry.name,
            entry.protocol,
            entry.fields.find((field) => field.name == SonarrFieldName.categories).value,
            entry.fields.find((field) => field.name == SonarrFieldName.minimumSeeders).value,
            entry.fields.find((field) => field.name == SonarrFieldName.baseUrl).value,
            entry.fields.find((field) => field.name == SonarrFieldName.apiKey).value,
            entry.fields.find((field) => field.name == SonarrFieldName.animeCategories).value,
        );

        let match = indexer.url.match(this.indexerRegex);
        if (match) {
            indexer.id = match.groups.id;
        }

        return indexer;
    }

    private generateDefaultBody(indexer: Indexer): SonarrEntry {
        const supportedCategories = this.categories.filter(id => indexer.categories.includes(id));
        const supportedAnimeCategories = this.animeCategories.filter(id => indexer.categories.includes(id));

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
                { name: SonarrFieldName.baseUrl, value: indexer.url },
                { name: SonarrFieldName.apiPath, value: '/api' },
                { name: SonarrFieldName.apiKey, value: indexer.key },
                { name: SonarrFieldName.categories, value: supportedCategories },
                { name: SonarrFieldName.animeCategories, value: supportedAnimeCategories },
                { name: SonarrFieldName.additionalParameters },
                { name: SonarrFieldName.minimumSeeders, value: this.seeds },
                { name: SonarrFieldName.seedRatio },
                { name: SonarrFieldName.seedTime },
                { name: SonarrFieldName.seasonPackSeedTime },
            ],
            implementationName: 'Torznab',
            implementation: 'Torznab',
            configContract: 'TorznabSettings',
            tags: [],
            id: undefined,
        };
    }
}