export interface RadarrEntry {
    enableRss: boolean,
    enableSearch: boolean,
    supportsRss: boolean,
    supportsSearch: boolean,
    protocol: string,
    implementationName: 'Torznab',
    implementation: 'Torznab',
    configContract: 'TorznabSettings',
    id?: number,
    name: string,
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
