export class JackettIndexer {
    id: string;
    title: string;
    protocol: string;
    categories: number[];
    url: string;
    key: string;

    constructor(
        id: string,
        title: string,
        protocol: string,
        categories: number[],
        url: string,
        key: string,
    ) {
        this.id = id;
        this.title = title;
        this.protocol = protocol;
        this.categories = categories;
        this.url = url;
        this.key = key;
    }
}