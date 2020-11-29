import { JackettIndexer } from './jackettIndexer';

export class Indexer {
    id: string | undefined;
    appId: number | undefined;
    title: string;
    protocol: string;
    categories: number[];
    animeCategories: number[];
    seeds: number;
    url: string;
    key: string;

    constructor(
        id: string | undefined,
        appId: number | undefined,
        title: string,
        protocol: string,
        categories: number[],
        seeds: number,
        url: string,
        key: string,
        animeCategories: number[],
    ) {
        this.id = id;
        this.appId = appId;
        this.title = title;
        this.protocol = protocol;
        this.categories = categories;
        this.seeds = seeds;
        this.url = url;
        this.key = key;
        this.animeCategories = animeCategories;
    }

    compare(other: JackettIndexer): boolean {
        return (
            this.title === other.title
            && this.protocol === other.protocol
            && this.url === other.url
            && this.key === other.key
        );
    }
}