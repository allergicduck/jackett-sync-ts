import { Service } from './service';
import { Indexer } from '../models/indexer';
import { RadarrEntry, RadarrFieldName } from '../interfaces/RadarrEntry';
import { Config } from '../config';
import { arrayEquals } from '../helper';
import { JackettIndexer } from '../models/jackettIndexer';

export class Radarr extends Service {
    animeCategories: number[];

    constructor() {
        const c = Config.radarr;
        super('Radarr', '/api', c.url, c.apiKey, c.categories, c.seeds);
        this.animeCategories = c.animeCategories;
    }

    protected mapToIndexer(entry: RadarrEntry) {
        const indexer = new Indexer(
            '',
            entry.id,
            entry.name,
            entry.protocol,
            entry.fields.find((field) => field.name == RadarrFieldName.Categories)!.value,
            entry.fields.find((field) => field.name == RadarrFieldName.MinimumSeeders)!.value,
            entry.fields.find((field) => field.name == RadarrFieldName.BaseUrl)!.value,
            entry.fields.find((field) => field.name == RadarrFieldName.ApiKey)!.value,
            entry.fields.find((field) => field.name == RadarrFieldName.AnimeCategories)!.value,
        );

        let match = indexer.url.match(this.indexerRegex);
        if (match && match.groups) {
            indexer.id = match.groups.id;
        }

        return indexer;
    }

    protected generateDefaultBody(indexer: JackettIndexer): RadarrEntry {
        const supportedCategories = this.categories.filter(id => indexer.categories.includes(id));
        const supportedAnimeCategories = this.animeCategories.filter(id => indexer.categories.includes(id));

        this.indexerSpecificConfiguration(indexer, supportedCategories);

        return {
            enableRss: true,
            enableSearch: true,
            supportsRss: true,
            supportsSearch: true,
            protocol: indexer.protocol,
            name: indexer.title,
            fields: [
                { name: RadarrFieldName.BaseUrl, value: indexer.url },
                { name: RadarrFieldName.MultiLanguages, value: '' },
                { name: RadarrFieldName.ApiKey, value: indexer.key },
                { name: RadarrFieldName.Categories, value: supportedCategories },
                { name: RadarrFieldName.AnimeCategories, value: supportedAnimeCategories },
                { name: RadarrFieldName.AdditionalParameters },
                { name: RadarrFieldName.RemoveYear, value: false },
                { name: RadarrFieldName.SearchByTitle, value: false },
                { name: RadarrFieldName.MinimumSeeders, value: this.seeds },
                { name: RadarrFieldName.RequiredFlags, value: '' },
            ],
            implementationName: 'Torznab',
            implementation: 'Torznab',
            configContract: 'TorznabSettings',
            id: undefined,
        };
    }

    protected shouldAdd(indexer: JackettIndexer): boolean {
        return indexer.categories.some(category => this.categories.includes(category))
            || indexer.categories.some(category => this.animeCategories.includes(category));
    }

    protected containsAllWantedCategories(current: Indexer, indexer: JackettIndexer): boolean {
        const availableCategories = this.categories.filter(id => indexer.categories.includes(id));
        const availableAnimeCategories = this.animeCategories.filter(id => indexer.categories.includes(id));

        this.indexerSpecificConfiguration(indexer, current.categories, true);

        return arrayEquals(current.categories, availableCategories) && arrayEquals(current.animeCategories, availableAnimeCategories);
    }
}