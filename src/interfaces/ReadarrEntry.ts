export interface ReadarrEntry {
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
    fields: ReadarrField[],
}

export interface ReadarrField {
    name: ReadarrFieldName,
    value?: any,
}

export enum ReadarrFieldName {
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