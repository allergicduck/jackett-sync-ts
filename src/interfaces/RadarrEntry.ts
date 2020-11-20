export interface RadarrEntry {
    enableRss: true,
    enableSearch: true,
    supportsRss: true,
    supportsSearch: true,
    protocol: string,
    implementationName: 'Torznab',
    implementation: 'Torznab',
    configContract: 'TorznabSettings',
    name: string,
    id?: number,
    fields: RadarrField[],
}

export interface RadarrField {
    order?: number,
    name: RadarrFieldName,
    label?: string,
    value?: any,
    type?: string,
    advanced?: boolean
}

export enum RadarrFieldName {
    BaseUrl = "BaseUrl",
    MultiLanguages = "MultiLanguages",
    ApiKey = "ApiKey",
    Categories = "Categories",
    AnimeCategories = "AnimeCategories",
    AdditionalParameters = "AdditionalParameters",
    RemoveYear = "RemoveYear",
    SearchByTitle = "SearchByTitle",
    MinimumSeeders = "MinimumSeeders",
    RequiredFlags = "RequiredFlags",
}
