export class Indexer {
    id: string;
    appId: number;
    title: string;
    protocol: string;
    categories: number[];
    seeds: number;
    url: string;
    key: string;

    constructor(
        id: string,
        appId: number,
        title: string,
        protocol: string,
        categories: number[],
        seeds: number,
        url: string,
        key: string,
    ) {
        this.id = id;
        this.appId = appId;
        this.title = title;
        this.protocol = protocol;
        this.categories = categories;
        this.seeds = seeds;
        this.url = url;
        this.key = key;
    }
}