import axios from 'axios';
import { parse } from 'fast-xml-parser';
import { CategoryEntry, JackettEntry } from '../interfaces/JackettEntry';
import { Config } from '../config';
import { JackettIndexer } from '../models/jackettIndexer';

const parseOpts = {
    attributeNamePrefix: '',
    ignoreAttributes: false,
};

export class Jackett {
    name = 'Jackett';
    url: string;
    altUrl?: string;
    apiKey: string;

    constructor() {
        const c = Config.jackett;
        this.checkUrlAndApiKey(c.url, c.apiKey);

        this.url = c.url!;
        this.altUrl = c.altUrl;
        this.apiKey = c.apiKey!;
    }

    protected checkUrlAndApiKey(url: string | undefined, apiKey: string | undefined) {
        if (url === null || url === undefined || url === '') {
            throw new Error(`No url provided`);
        }

        if (apiKey === null || apiKey === undefined || apiKey === '') {
            throw new Error(`No apiKey provided`);
        }
    }

    async getIndexers(): Promise<JackettIndexer[]> {
        const requestUrl = `${this.url}/api/v2.0/indexers/all/results/torznab/api?apikey=${this.apiKey}&t=indexers&configured=true`;
        const response = await axios.get(requestUrl).catch((error) => {
            throw error;
        });

        const parsedXML = parse(response.data, parseOpts);

        if (parsedXML.error) {
            throw new Error('Jackett: ' + parsedXML.error.description);
        }

        const indexers = parsedXML.indexers.indexer as JackettEntry[];

        return indexers.map((entry) => this.mapToIndexer(entry));
    }

    private mapToIndexer(entry: JackettEntry): JackettIndexer {
        let categories = Jackett.parseCategories(entry.caps.categories.category);

        return new JackettIndexer(
            entry.id,
            entry.title,
            'torrent',
            categories,
            `${this.altUrl || this.url}/api/v2.0/indexers/${entry.id}/results/torznab/`,
            this.apiKey,
        );
    }

    private static parseCategories(category: CategoryEntry[] | CategoryEntry): number[] {
        let categoryEntry = category;

        if (!Array.isArray(categoryEntry)) {
            categoryEntry = [categoryEntry];
        }

        const categories: number[] = [];

        categoryEntry.map((cat) => {
            categories.push(parseInt(cat.id));
            if (cat.subcat) {
                if (Array.isArray(cat.subcat)) {
                    cat.subcat.map((subCat) => {
                        categories.push(parseInt(subCat.id));
                    });
                } else {
                    categories.push(parseInt(cat.subcat.id));
                }
            }
        });

        return categories;
    }
}