import { Service } from './service';
import { Indexer } from '../models/indexer';
import { SonarrFieldName, SonarrEntry } from '../interfaces/SonarrEntry';
import { Config } from '../config';
import { arrayEquals } from '../helper';
import { JackettIndexer } from '../models/jackettIndexer';

export class Sonarr extends Service {
    animeCategories: number[];

    constructor() {
        const c = Config.sonarr;
        super('Sonarr', '/api/v3/', c.url, c.apiKey, c.categories, c.seeds);
        this.animeCategories = c.animeCategories;
    }

    protected mapToIndexer(entry: SonarrEntry): Indexer {
        const indexer = new Indexer(
            '',
            entry.id,
            entry.name,
            entry.protocol,
            entry.fields.find((field) => field.name == SonarrFieldName.categories)!.value,
            entry.fields.find((field) => field.name == SonarrFieldName.minimumSeeders)!.value,
            entry.fields.find((field) => field.name == SonarrFieldName.baseUrl)!.value,
            entry.fields.find((field) => field.name == SonarrFieldName.apiKey)!.value,
            entry.fields.find((field) => field.name == SonarrFieldName.animeCategories)!.value,
        );

        let match = indexer.url.match(this.indexerRegex);
        if (match && match.groups) {
            indexer.id = match.groups.id;
        }

        return indexer;
    }

    protected generateDefaultBody(indexer: JackettIndexer): SonarrEntry {
        const supportedCategories = this.categories.filter(id => indexer.categories.includes(id));
        const supportedAnimeCategories = this.animeCategories.filter(id => indexer.categories.includes(id));

        this.indexerSpecificConfiguration(indexer, supportedCategories);

        return {
            priority: 0,
            enableRss: true,
            enableAutomaticSearch: true,
            enableInteractiveSearch: true,
            supportsRss: true,
            supportsSearch: true,
            protocol: indexer.protocol,
            name: indexer.title,
            fields: [
                { name: SonarrFieldName.baseUrl, value: indexer.url },
                { name: SonarrFieldName.apiPath, value: '/api' },
                { name: SonarrFieldName.apiKey, value: indexer.key },
                { name: SonarrFieldName.categories, value: supportedCategories },
                { name: SonarrFieldName.animeCategories, value: supportedAnimeCategories },
                { name: SonarrFieldName.additionalParameters },
                { name: SonarrFieldName.minimumSeeders, value: this.seeds },
                { name: SonarrFieldName.seedRatio },
                { name: SonarrFieldName.seedTime },
                { name: SonarrFieldName.seasonPackSeedTime },
            ],
            implementationName: 'Torznab',
            implementation: 'Torznab',
            configContract: 'TorznabSettings',
            tags: [],
            id: undefined,
        };
    }

    protected shouldAdd(indexer: JackettIndexer) {
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