import {Service} from "./service";
import axios from 'axios';
import {Indexer} from "../models/indexer";

export class Lidarr extends Service {
    constructor(url: string, key: string, categories = [3000, 3010, 3020, 3030, 3040], seeds = 1) {
        super(url, key, categories, seeds);
    }

    async get(): Promise<Indexer[]> {
        const reqUrl = `${this.url}/api/v1/indexer?apikey=${this.key}`;

        const response = await axios.get(reqUrl);
        const indexers: Indexer[] = [];

        response.data.forEach(entry => {
            const indexer = new Indexer("", entry.id, entry.name, entry.protocol, [], entry.fields[6].value, entry.fields[0].value, "")

            let match = indexer.url.match(this.indexerRegex);
            if (match) {
                indexer.id = match.groups.id;
            }

            indexers.push(indexer);
        });

        return indexers;
    }

    async add(indexer) {
        const reqUrl = `${this.url}/api/v1/indexer?apikey=${this.key}`

        const body = {
            enableRss: true,
            enableAutomaticSearch: true,
            enableInteractiveSearch: true,
            supportsRss: true,
            supportsSearch: true,
            protocol: indexer.protocol,
            name: indexer.title,
            fields: [
                {name: 'baseUrl', value: indexer.url},
                {name: 'apiPath', value: '/api'},
                {name: 'apiKey', value: indexer.key},
                {name: 'categories', value: this.categories},
                {name: 'earlyReleaseLimit'},
                {name: 'additionalParameters'},
                {name: 'minimumSeeders', value: this.seeds},
                {name: 'seedCriteria.seedRatio'},
                {name: 'seedCriteria.seedTime'},
                {name: 'seedCriteria.discographySeedTime'}
            ],
            implementationName: 'Torznab',
            implementation: 'Torznab',
            configContract: 'TorznabSettings',
            tags: []
        }

        try {
            const resp = await axios.post(reqUrl, body);
            console.log(`[Lidarr] Added ${indexer.id} successfully`);
        } catch (e) {
            console.error(`[Lidarr] Failed to add ${indexer.id}: ${e.response.data[0] ? e.response.data[0].errorMessage : e}`);
        }
    }

    async update(current, indexer) {
        const reqUrl = `${this.url}/api/v1/indexer/${current.appId}?apikey=${this.key}`

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
                {name: 'baseUrl', value: indexer.url},
                {name: 'apiPath', value: '/api'},
                {name: 'apiKey', value: indexer.key},
                {name: 'categories', value: this.categories},
                {name: 'earlyReleaseLimit'},
                {name: 'additionalParameters'},
                {name: 'minimumSeeders', value: this.seeds},
                {name: 'seedCriteria.seedRatio'},
                {name: 'seedCriteria.seedTime'},
                {name: 'seedCriteria.discographySeedTime'}
            ],
            implementationName: 'Torznab',
            implementation: 'Torznab',
            configContract: 'TorznabSettings',
            tags: [],
        }

        try {
            const resp = await axios.put(reqUrl, body);
            console.log(`[Lidarr] Updated ${indexer.id} successfully`);
        } catch (e) {
            console.error(`[Lidarr] Failed to update ${indexer.id}: ${e.response.data[0] ? e.response.data[0].errorMessage : e}`);
        }
    }
}