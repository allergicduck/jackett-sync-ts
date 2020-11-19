export interface SonarrEntry {
    enableRss: boolean,
    enableAutomaticSearch: boolean,
    enableInteractiveSearch: boolean,
    supportsRss: boolean,
    supportsSearch: boolean,
    protocol: 'torrent',
    priority: number,
    name: string,
    fields: Field[],
    implementationName: 'Torznab',
    implementation: 'Torznab',
    configContract: 'TorznabSettings',
    infoLink: string,
    tags: [],
    id: number
}

export interface Field {
    order: number,
    name: FieldName,
    label: string,
    value: any,
    type: string,
    advanced: boolean
}

export enum FieldName {
    baseUrl = "baseUrl",
    apiPath = "apiPath",
    apiKey = "apiKey",
    categories = "categories",
    animeCategories = "animeCategories",
    additionalParameters = "additionalParameters",
    minimumSeeders = "minimumSeeders",
    seedRatio = "seedCriteria.seedRatio",
    seedTime = "seedCriteria.seedTime",
    seasonPackSeedTime = "seedCriteria.seasonPackSeedTime",
}
