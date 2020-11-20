export interface ReaderrEntry {
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
    fields: ReaderrField[],
}

export interface ReaderrField {
    order?: number,
    name: ReaderrFieldName,
    label?: string,
    value?: any,
    type?: string,
    advanced?: boolean
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
