export class IndexSpecificRule {
    service: Services;
    indexerId: string;
    category?: number;
    animeCategory?: number;

    constructor(service: Services, indexerId: string, category: number | undefined, animeCategory: number | undefined) {
        this.service = service;
        this.indexerId = indexerId;
        this.category = category;
        this.animeCategory = animeCategory;
    }
}

export enum Services {
    ALL = 'ALL',
    LIDARR = 'LIDARR',
    RADARR = 'RADARR',
    SONARR = 'SONARR',
    READARR = 'READARR',
}

