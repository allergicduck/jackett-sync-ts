import { Service } from './service';
import axios, { AxiosResponse } from 'axios';
import { Indexer } from '../models/indexer';
import { RadarrEntry, RadarrFieldName } from '../interfaces/RadarrEntry';
import { Config } from '../config';
import { arrayEquals } from '../helper';

export class Radarr extends Service {
    animeCategories: number[];

    constructor() {
        const c = Config.radarr;
        super('Radarr', c.url, c.apiKey, c.categories, c.seeds);
        this.systemStatusUrl = `${this.url}/api/system/status?apikey=${this.key}`
        this.animeCategories = c.animeCategories;
    }

    async getIndexers(): Promise<void> {
        const reqUrl = `${this.url}/api/indexer?apikey=${this.key}`;
        this.indexers = await this.handleIndexersRequest(reqUrl);
    }

    protected add(indexer): Promise<AxiosResponse> {
        const reqUrl = `${this.url}/api/indexer?apikey=${this.key}`;
        const body = this.generateDefaultBody(indexer);

        return axios.post(reqUrl, body);
    }

    protected update(appId: number, indexer: Indexer): Promise<AxiosResponse> {
        const reqUrl = `${this.url}/api/indexer/${appId}?apikey=${this.key}`;
        const body = this.generateDefaultBody(indexer);
        body.id = appId;

        return axios.put(reqUrl, body);
    }

    protected mapToIndexer(entry: RadarrEntry) {
        const indexer = new Indexer(
            '',
            entry.id,
            entry.name,
            entry.protocol,
            entry.fields.find((field) => field.name == RadarrFieldName.Categories).value,
            entry.fields.find((field) => field.name == RadarrFieldName.MinimumSeeders).value,
            entry.fields.find((field) => field.name == RadarrFieldName.BaseUrl).value,
            entry.fields.find((field) => field.name == RadarrFieldName.ApiKey).value,
            entry.fields.find((field) => field.name == RadarrFieldName.AnimeCategories).value,
        );

        let match = indexer.url.match(this.indexerRegex);
        if (match) {
            indexer.id = match.groups.id;
        }

        return indexer;
    }

    protected generateDefaultBody(indexer: Indexer): RadarrEntry {
        const supportedCategories = this.categories.filter(id => indexer.categories.includes(id));
        const supportedAnimeCategories = this.animeCategories.filter(id => indexer.categories.includes(id));

        return {
            enableRss: true,
            enableSearch: true,
            supportsRss: true,
            supportsSearch: true,
            protocol: indexer.protocol,
            name: indexer.title,
            fields: [
                { name: RadarrFieldName.BaseUrl, value: indexer.url },
                { name: RadarrFieldName.MultiLanguages, value: '' },
                { name: RadarrFieldName.ApiKey, value: indexer.key },
                { name: RadarrFieldName.Categories, value: supportedCategories },
                { name: RadarrFieldName.AnimeCategories, value: supportedAnimeCategories },
                { name: RadarrFieldName.AdditionalParameters },
                { name: RadarrFieldName.RemoveYear, value: false },
                { name: RadarrFieldName.SearchByTitle, value: false },
                { name: RadarrFieldName.MinimumSeeders, value: this.seeds },
                { name: RadarrFieldName.RequiredFlags, value: '' },
            ],
            implementationName: 'Torznab',
            implementation: 'Torznab',
            configContract: 'TorznabSettings',
            id: undefined,
        };
    }

    protected shouldAdd(indexer: Indexer): boolean {
        return indexer.categories.some(category => this.categories.includes(category))
            || indexer.categories.some(category => this.animeCategories.includes(category));
    }

    protected containsAllWantedCategories(current: Indexer, indexer: Indexer): boolean {
        const availableCategories = this.categories.filter(id => indexer.categories.includes(id));
        const availableAnimeCategories = this.animeCategories.filter(id => indexer.categories.includes(id));
        return arrayEquals(current.categories, availableCategories) && arrayEquals(current.animeCategories, availableAnimeCategories);
    }
}