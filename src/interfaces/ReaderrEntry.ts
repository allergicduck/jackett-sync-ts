export interface ReaderrEntry {
    enableRss: boolean,
    enableAutomaticSearch: boolean,
    enableInteractiveSearch: boolean,
    supportsRss: boolean,
    supportsSearch: boolean,
    protocol: string,
    priority: number,
    implementationName: 'Torznab',
    implementation: 'Torznab',
    configContract: 'TorznabSettings',
    tags: []
    id?: number
    name: string,
    fields: ReaderrField[],
}

export interface ReaderrField {
    name: ReaderrFieldName,
    value?: any,
}

export enum ReaderrFieldName {
    baseUrl = 'baseUrl',
    apiPath = 'apiPath',
    apiKey = 'apiKey',
    categories = 'categories',
    earlyReleaseLimit = 'earlyReleaseLimit',
    additionalParameters = 'additionalParameters',
    minimumSeeders = 'minimumSeeders',
    seedRatio = 'seedCriteria.seedRatio',
    seedTime = 'seedCriteria.seedTime',
    discographySeedTime = 'seedCriteria.discographySeedTime',
}