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
    baseUrl = "baseUrl",
    apiPath = "apiPath",
    multiLanguages = "multiLanguages",
    apiKey = "apiKey",
    categories = "categories",
    additionalParameters = "additionalParameters",
    removeYear = "removeYear",
    minimumSeeders = "minimumSeeders",
    seedRatio = "seedCriteria.seedRatio",
    seedTime = "seedCriteria.seedTime",
    requiredFlags = "requiredFlags",
}
