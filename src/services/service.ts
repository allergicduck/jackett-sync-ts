import { Indexer } from '../models/indexer';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { arrayEquals } from '../helper';

export abstract class Service {
    protected indexerRegex = /.*\/api\/v2.0\/indexers\/(?<id>.*)\/results\/torznab\//;

    name: string;
    url: string;
    systemStatusUrl: string;
    key: string;
    categories: number[];
    seeds: number;
    indexers: Indexer[];

    protected constructor(name: string, url: string, key: string, categories: number[], seeds: number) {
        this.name = name;
        this.url = url;
        this.key = key;
        this.categories = categories;
        this.seeds = seeds;
    }

    async validate(): Promise<AxiosResponse> {
        if(this.url === null || this.url === undefined || this.url === "") {
            throw new Error(`[${this.name}] No url provided`)
        }

        if(this.key === null || this.key === undefined || this.key === "") {
            throw new Error(`[${this.name}] No apiKey provided`)
        }

        return axios.get(this.systemStatusUrl);
    }

    abstract async getIndexers(): Promise<void>;

    protected abstract add(indexer: Indexer): Promise<AxiosResponse>;

    protected abstract update(appId: number, indexer: Indexer): Promise<AxiosResponse>;

    protected abstract mapToIndexer(entry): Indexer;

    protected abstract generateDefaultBody(indexer: Indexer);

    async sync(jackettIndexers: Indexer[]) {
        const { add, update } = this.checkDifferences(jackettIndexers);

        const addPromises = add.map(async (indexer) => {
            return this.handleRequest(this.add(indexer));
        });

        const updatePromises = update.map(async (indexer) => {
            const appId = this.indexers.find((existingIndexer) => existingIndexer.id === indexer.id).appId;
            return this.handleRequest(this.update(appId, indexer));
        });

        return await Promise.all(addPromises) && await Promise.all(updatePromises);
    }

    protected handleIndexersRequest(url: string): Promise<Indexer[]> {
        return axios.get(url)
            .then((response) => response.data.map((entry) => this.mapToIndexer(entry)))
            .catch((error) => {
                if (error && error.response) {
                    const axiosError = error as AxiosError;
                    console.error(`[${this.name}][${axiosError.response.status}] Couldn't get indexes, error: ${JSON.stringify(axiosError.response.data)}, url: ${axiosError.config.url}`);
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
                console.error(`[${this.name}][${axiosError.response.status}] Something went wrong with ${data.name}, error: ${axiosError.response.data[0]?.errorMessage}`);
            } else {
                console.error(`[${this.name}] Unexpected error during request`, error);
            }
        });
    }

    private checkDifferences(jackettIndexers: Indexer[]): { add: Indexer[], update: Indexer[] } {
        const idList = jackettIndexers.map(el => el.id);
        const serviceIdList = this.indexers.map((indexer) => indexer.id);

        const diff = idList.filter((id) => !serviceIdList.includes(id));
        const shouldBeAddedIndexers = diff.map((indexersId) => {
            const indexer = jackettIndexers.find((indexer) => indexer.id == indexersId);
            if (this.shouldAdd(indexer)) {
                return indexer;
            }
        }).filter(exists => exists);

        const same = idList.filter((id) => serviceIdList.includes(id));
        const shouldBeUpdatedIndexers = same.map((indexersId) => {
            const jacketIndexer = jackettIndexers.find((indexer) => indexer.id == indexersId);
            const existingIndexer = this.indexers.find((indexer) => indexer.id == indexersId);
            if (this.shouldUpdate(existingIndexer, jacketIndexer)) {
                return jacketIndexer;
            }
        }).filter(exists => exists);

        return { add: shouldBeAddedIndexers, update: shouldBeUpdatedIndexers };
    }

    protected shouldAdd(indexer: Indexer) {
        return indexer.categories.some(category => this.categories.includes(category));
    }

    protected shouldUpdate(current: Indexer, indexer: Indexer) {
        return !current.compare(indexer) || !this.containsAllWantedCategories(current, indexer);
    }

    protected containsAllWantedCategories(current: Indexer, indexer: Indexer): boolean {
        const availableCategories = this.categories.filter(id => indexer.categories.includes(id));
        return arrayEquals(current.categories, availableCategories);
    }
}