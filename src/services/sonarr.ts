import { Service } from './service';
import { Indexer } from '../models/indexer';
import { SonarrEntry, SonarrFieldName } from '../interfaces/SonarrEntry';
import { Config } from '../config';
import { arrayEquals, getIdFromIndexerUrl } from '../helper';
import { JackettIndexer } from '../models/jackettIndexer';
import { ApiRoutes } from '../models/apiRoutes';
import { Services } from '../models/indexSpecificRule';

export class Sonarr extends Service {
    apiRoutes: ApiRoutes;
    animeCategories: number[];

    constructor() {
        const c = Config.sonarr;
        super(Services.SONARR, c.categories, c.seeds);
        this.checkUrlAndApiKey(c.url, c.apiKey);

        this.animeCategories = c.animeCategories;
        this.apiRoutes = new ApiRoutes(c.url!, '/api/v3', c.apiKey!);
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
            entry.fields.find((field) => field.name == SonarrFieldName.apiKey)?.value,
            entry.fields.find((field) => field.name == SonarrFieldName.animeCategories)!.value,
        );

        indexer.id = getIdFromIndexerUrl(indexer.url);

        return indexer;
    }

    protected generateDefaultBody(indexer: JackettIndexer): SonarrEntry {
        const supportedCategories = this.categories.filter(id => indexer.categories.includes(id));
        const supportedAnimeCategories = this.animeCategories.filter(id => indexer.categories.includes(id));

        this.indexerSpecificConfiguration(indexer, supportedCategories, supportedAnimeCategories);

        return {
            priority: 25,
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

        this.undoIndexerSpecificConfiguration(indexer, current.categories, current.animeCategories);

        return arrayEquals(current.categories, availableCategories) && arrayEquals(current.animeCategories, availableAnimeCategories);
    }
}