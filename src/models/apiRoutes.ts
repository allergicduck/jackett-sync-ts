export class ApiRoutes {
    private readonly url: string;
    private readonly apiKey: string;
    private readonly baseApi: string;

    private readonly systemPath: string;
    private readonly indexerPath: string;

    constructor(url: string, baseApi: string, apiKey: string, systemPath = '/system/status', indexerPath = '/indexer') {
        this.url = url;
        this.apiKey = apiKey;
        this.baseApi = baseApi;
        this.systemPath = systemPath;
        this.indexerPath = indexerPath;
    }

    private constructUrl(path: string) {
        return this.url + this.baseApi + path + `?apikey=${this.apiKey}`;
    }

    public getSystemUrl() {
        return this.constructUrl(this.systemPath);
    }

    public getIndexerUrl() {
        return this.constructUrl(this.indexerPath);
    }

    public getSpecificIndexerUrl(appId: number | undefined) {
        return this.constructUrl(this.indexerPath + `/${appId}`);
    }
}