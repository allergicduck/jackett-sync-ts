export interface LidarrEntry {
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
    id?: number
    fields: LidarrField[],
}

export interface LidarrField {
    order?: number,
    name: LidarrFieldName,
    label?: string,
    value?: any,
    type?: string,
    advanced?: boolean
}

export enum LidarrFieldName {
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
