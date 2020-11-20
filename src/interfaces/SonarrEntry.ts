export interface SonarrEntry {
    enableRss: true,
    enableAutomaticSearch: true,
    enableInteractiveSearch: true,
    supportsRss: true,
    supportsSearch: true,
    protocol: string,
    priority: number,
    implementationName: 'Torznab',
    implementation: 'Torznab',
    configContract: 'TorznabSettings',
    tags: [],
    name: string,
    id: number
    fields: SonarrField[],
}

export interface SonarrField {
    order?: number,
    name: SonarrFieldName,
    label?: string,
    value?: any,
    type?: string,
    advanced?: boolean
}

export enum SonarrFieldName {
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
