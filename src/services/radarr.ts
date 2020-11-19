import {Service} from "./service";
import axios from 'axios';
import {defaultSchema} from "../helpers";
import {Indexer} from "../models/indexer";

export class Radarr extends Service {
    constructor(url: string, key: string, categories = [2000, 2010, 2020, 2030, 2035, 2040, 2045, 2050, 2060], seeds = 1) {
        super(url, key, categories, seeds);
    }

    async get(): Promise<Indexer[]> {
        const reqUrl = `${this.url}/api/indexer?apikey=${this.key}`;

        const response = await axios.get(reqUrl);
        const indexers: Indexer[] = [];

        response.data.forEach(entry => {
            const indexer = new Indexer("", entry.id, entry.name, entry.protocol, [], entry.fields[8].value, entry.fields[0].value, "")

            let match = indexer.url.match(this.indexerRegex);
            if (match) {
                indexer.id = match.groups.id;
            }

            indexers.push(indexer);
        });

        return indexers;
    }

    async add(indexer) {
        const reqUrl = `${this.url}/api/indexer?apikey=${this.key}`

        const body = {
            enableRss: true,
            enableSearch: true,
            supportsRss: true,
            supportsSearch: true,
            protocol: indexer.protocol,
            name: indexer.title,
            fields: [
                {name: 'BaseUrl', value: indexer.url},
                {name: 'MultiLanguages', value: ''},
                {name: 'ApiKey', value: indexer.key},
                {name: 'Categories', value: this.categories,},
                {name: 'AnimeCategories', value: []},
                {name: 'AdditionalParameters',},
                {name: 'RemoveYear', value: false,},
                {name: 'SearchByTitle', value: false,},
                {name: 'MinimumSeeders', value: this.seeds,},
                {name: 'RequiredFlags', value: ''}
            ],
            implementationName: 'Torznab',
            implementation: 'Torznab',
            configContract: 'TorznabSettings'
        }

        try {
            const resp = await axios.post(reqUrl, body);
            console.log(`[Radarr] Added ${indexer.id} successfully`);
        } catch (e) {
            console.error(`[Radarr] Failed to add ${indexer.id}: ${e.response.data[0] ? e.response.data[0].errorMessage : e}`);
        }
    }

    async update(current, indexer) {
        const reqUrl = `${this.url}/api/indexer/${current.appId}?apikey=${this.key}`

        const body = {
            enableRss: true,
            enableAutomaticSearch: true,
            enableInteractiveSearch: true,
            supportsRss: true,
            supportsSearch: true,
            protocol: indexer.protocol,
            name: indexer.title,
            id: current.appId,
            fields: [
                {name: 'BaseUrl', value: indexer.url},
                {name: 'MultiLanguages', value: ''},
                {name: 'ApiKey', value: indexer.key},
                {name: 'Categories', value: this.categories},
                {name: 'AnimeCategories', value: []},
                {name: 'AdditionalParameters'},
                {name: 'RemoveYear', value: false},
                {name: 'SearchByTitle', value: false},
                {name: 'MinimumSeeders', value: this.seeds},
                {name: 'RequiredFlags', value: ''}
            ],
            implementationName: 'Torznab',
            implementation: 'Torznab',
            configContract: 'TorznabSettings',
            tags: [],
        }

        try {
            const resp = await axios.put(reqUrl, body);
            console.log(`[Radarr] Updated ${indexer.id} successfully`);
        } catch (e) {
            console.error(`[Radarr] Failed to update ${indexer.id}: ${e.response.data[0] ? e.response.data[0].errorMessage : e}`);
        }
    }
}