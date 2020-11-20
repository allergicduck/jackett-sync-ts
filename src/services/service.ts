import { Indexer } from '../models/indexer';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { arrayEquals, Entry } from '../helper';
import { JackettIndexer } from '../models/jackettIndexer';
import { SonarrEntry } from '../interfaces/SonarrEntry';
import { RadarrEntry } from '../interfaces/RadarrEntry';
import { LidarrEntry } from '../interfaces/LidarrEntry';
import { ReaderrEntry } from '../interfaces/ReaderrEntry';

export abstract class Service {
    protected indexerRegex = /.*\/api\/v2.0\/indexers\/(?<id>.*)\/results\/torznab\//;

    name: string;
    url?: string;
    apiKey?: string;
    categories: number[];
    seeds: number;
    indexers: Indexer[] = [];
    apiPath: string;

    protected constructor(name: string, apiPath: string, url: string | undefined, key: string | undefined, categories: number[], seeds: number) {
        this.name = name;
        this.url = url;
        this.apiKey = key;
        this.categories = categories;
        this.seeds = seeds;
        this.apiPath = apiPath;
    }

    async validate(): Promise<AxiosResponse> {
        if (this.url === null || this.url === undefined || this.url === '') {
            throw new Error(`[${this.name}] No url provided`);
        }

        if (this.apiKey === null || this.apiKey === undefined || this.apiKey === '') {
            throw new Error(`[${this.name}] No apiKey provided`);
        }
        const systemStatusUrl = `${this.url}${this.apiPath}/system/status?apikey=${this.apiKey}`;
        return axios.get(systemStatusUrl);
    }

    async getIndexers(): Promise<void> {
        const reqUrl = `${this.url}${this.apiPath}/indexer?apikey=${this.apiKey}`;
        this.indexers = await this.handleIndexersRequest(reqUrl);
    };

    protected add(indexer: JackettIndexer) {
        const reqUrl = `${this.url}${this.apiPath}/indexer?apikey=${this.apiKey}`;
        const body = this.generateDefaultBody(indexer);

        return axios.post(reqUrl, body);
    }

    protected update(appId: number | undefined, indexer: JackettIndexer): Promise<AxiosResponse> {
        const reqUrl = `${this.url}${this.apiPath}/indexer/${appId}?apikey=${this.apiKey}`;
        const body = this.generateDefaultBody(indexer);
        body.id = appId;

        return axios.put(reqUrl, body);
    }

    protected abstract mapToIndexer(entry: Entry): Indexer;

    protected abstract generateDefaultBody(indexer: JackettIndexer): Entry;

    async sync(jackettIndexers: JackettIndexer[]) {
        const { add, update } = this.checkDifferences(jackettIndexers);

        const addPromises = add.map(async (indexer) => {
            return this.handleRequest(this.add(indexer));
        });

        const updatePromises = update.map(async (indexer) => {
            const appId = this.indexers.find((existingIndexer) => existingIndexer.id === indexer.id)!.appId;
            return this.handleRequest(this.update(appId, indexer));
        });

        return await Promise.all(addPromises) && await Promise.all(updatePromises);
    }

    protected handleIndexersRequest(url: string): Promise<Indexer[]> {
        return axios.get(url)
            .then((response) => response.data.map((entry: Entry) => this.mapToIndexer(entry)))
            .catch((error) => {
                if (error && error.response) {
                    const axiosError = error as AxiosError;
                    console.error(`[${this.name}][${axiosError.response?.status}] Couldn't get indexes, error: ${JSON.stringify(axiosError.response?.data)}, url: ${axiosError.config.url}`);
                } else {
                    console.error(`[${this.name}] Unexpected error during request`, error);
                }
                throw error;
            });
    }

    private handleRequest(axiosResponsePromise: Promise<AxiosResponse>) {
        return axiosResponsePromise.then((response) => {
            if (response.status == 201) {
                console.log(`[${this.name}] Added ${response.data.name} successfully!`);
            } else if (response.status == 202) {
                console.log(`[${this.name}] Updated ${response.data.name} successfully!`);
            } else {
                console.log(`[${this.name}] Request successful, but unknown responseStatus`, response.data.name);
            }
        }).catch((error) => {
            if (error && error.response) {
                const axiosError = error as AxiosError;
                const data = JSON.parse(error.response.config.data);
                console.error(`[${this.name}][${axiosError.response?.status}] Something went wrong with ${data.name}, error: ${axiosError.response?.data[0]?.errorMessage}`);
            } else {
                console.error(`[${this.name}] Unexpected error during request`, error);
            }
        });
    }

    private checkDifferences(jackettIndexers: JackettIndexer[]): { add: JackettIndexer[], update: JackettIndexer[] } {
        const idList = jackettIndexers.map(el => el.id);
        const serviceIdList = this.indexers.map((indexer) => indexer.id);

        const diff = idList.filter((id) => !serviceIdList.includes(id));
        const shouldBeAddedIndexers = diff.map((indexersId) => {
            const indexer = jackettIndexers.find((indexer) => indexer.id == indexersId)!;
            if (this.shouldAdd(indexer)) {
                return indexer;
            }
        }).filter(exists => exists) as JackettIndexer[];

        const same = idList.filter((id) => serviceIdList.includes(id));
        const shouldBeUpdatedIndexers = same.map((indexersId) => {
            const jacketIndexer = jackettIndexers.find((indexer) => indexer.id == indexersId)!;
            const existingIndexer = this.indexers.find((indexer) => indexer.id == indexersId)!;
            if (this.shouldUpdate(existingIndexer, jacketIndexer)) {
                return jacketIndexer;
            }
        }).filter(exists => exists) as JackettIndexer[];

        return { add: shouldBeAddedIndexers, update: shouldBeUpdatedIndexers };
    }

    protected shouldAdd(indexer: JackettIndexer) {
        return indexer.categories.some(category => this.categories.includes(category));
    }

    protected shouldUpdate(current: Indexer, indexer: JackettIndexer) {
        return !current.compare(indexer) || !this.containsAllWantedCategories(current, indexer);
    }

    protected containsAllWantedCategories(current: Indexer, indexer: JackettIndexer): boolean {
        const availableCategories = this.categories.filter(id => indexer.categories.includes(id));

        this.indexerSpecificConfiguration(indexer, current.categories, true);

        return arrayEquals(current.categories, availableCategories);
    }

    protected indexerSpecificConfiguration(indexer: JackettIndexer, supportedCategories: number[], undo: boolean = false) {
        if(!undo) {
            if(indexer.id === "limetorrents") {
                console.log(`[${this.name}] Detected index specific setting, adding category 8000`);
                supportedCategories.push(8000);
            }
        } else {
            if(indexer.id === "limetorrents") {
                supportedCategories.splice(supportedCategories.indexOf(8000), 1);
            }
        }
    }
}