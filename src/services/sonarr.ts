import { Service } from './service';
import axios from 'axios';
import { Indexer } from '../models/indexer';
import { FieldName, SonarrEntry } from '../interfaces/SonarrEntry';

export class Sonarr extends Service {
    animeCategories: number[];

    constructor(url: string, key: string, categories: number[], animeCategories: number[], seeds: number) {
        super(url, key, categories, seeds);
        this.animeCategories = animeCategories;
    }

    async get(): Promise<Indexer[]> {
        const reqUrl = `${this.url}/api/v3/indexer?apikey=${this.key}`;

        const response = await axios.get(reqUrl);

        return response.data.map((entry: SonarrEntry) => {
            const indexer = new Indexer(
                '',
                entry.id,
                entry.name,
                entry.protocol,
                entry.fields.find((field) => field.name == FieldName.categories).value,
                entry.fields.find((field) => field.name == FieldName.minimumSeeders).value,
                entry.fields.find((field) => field.name == FieldName.baseUrl).value,
                entry.fields.find((field) => field.name == FieldName.apiKey).value,
            );

            let match = indexer.url.match(this.indexerRegex);
            if (match) {
                indexer.id = match.groups.id;
            }

            return indexer;
        });
    }

    async add(indexer: Indexer) {
        const reqUrl = `${this.url}/api/v3/indexer?apikey=${this.key}`;

        const body = this.generateDefaultBody(indexer);

        try {
            const resp = await axios.post(reqUrl, body);
            if(resp.status == 201) {
                console.log(`[Sonarr] Added ${indexer.id} successfully`);
            } else {
                console.error(`[Sonarr] Failed to add ${indexer.id}: ${resp.data[0] ? resp.data[0].errorMessage : ""}`);
            }
        } catch (e) {
            console.error(`[Sonarr] Failed to add ${indexer.id}: ${e.response.data[0] ? e.response.data[0].errorMessage : e}`);
        }
    }

    async update(current: Indexer, indexer: Indexer) {
        const reqUrl = `${this.url}/api/v3/indexer/${current.appId}?apikey=${this.key}`;

        const body = this.generateDefaultBody(indexer);
        body.id = current.appId;

        try {
            const resp = await axios.put(reqUrl, body);
            console.log(`[Sonarr] Updated ${indexer.id} successfully`);
        } catch (e) {
            console.error(`[Sonarr] Failed to update ${indexer.id}: ${e.response.data[0] ? e.response.data[0].errorMessage : e}`);
        }
    }

    shouldAdd(indexer: Indexer) {
        return indexer.categories.some(category => this.categories.includes(category))
            || indexer.categories.some(category => this.animeCategories.includes(category));
    }

    private generateDefaultBody(indexer: Indexer) {
        const supportedCategories = this.categories.filter(id => indexer.categories.includes(id));
        const supportedAnimeCategories = this.animeCategories.filter(id => indexer.categories.includes(id));

        return {
            enableRss: true,
            enableAutomaticSearch: true,
            enableInteractiveSearch: true,
            supportsRss: true,
            supportsSearch: true,
            protocol: indexer.protocol,
            name: indexer.title,
            fields: [
                { name: FieldName.baseUrl, value: indexer.url },
                { name: FieldName.apiPath, value: '/api' },
                { name: FieldName.apiKey, value: indexer.key },
                { name: FieldName.categories, value: supportedCategories },
                { name: FieldName.animeCategories, value: supportedAnimeCategories },
                { name: FieldName.additionalParameters },
                { name: FieldName.minimumSeeders, value: this.seeds },
                { name: FieldName.seedRatio },
                { name: FieldName.seedTime },
                { name: FieldName.seasonPackSeedTime },
            ],
            implementationName: 'Torznab',
            implementation: 'Torznab',
            configContract: 'TorznabSettings',
            tags: [],
            id: undefined,
        };
    }
}