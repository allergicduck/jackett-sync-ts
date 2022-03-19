import { IndexSpecificRule, Services } from './models/indexSpecificRule';

export class Config {
    public static jackett = {
        url: process.env.JACKETT_URL,
        altUrl: process.env.JACKETT_ALTURL,
        apiKey: process.env.JACKETT_KEY,
    };

    public static sonarr = {
        url: process.env.SONARR_URL,
        apiKey: process.env.SONARR_KEY,
        apiPath: process.env.SONARR_PATH || '/api/v3',
        categories: [5000, 5030, 5040, 8000],
        animeCategories: [5070],
        seeds: parseInt(process.env.SONARR_MIN_SEEDS || '1'),
    };

    public static radarr = {
        url: process.env.RADARR_URL,
        apiKey: process.env.RADARR_KEY,
        apiPath: process.env.RADARR_PATH || '/api/v3',
        categories: [2000, 2010, 2020, 2030, 2035, 2040, 2045, 2050, 2060, 8000],
        seeds: parseInt(process.env.RADARR_MIN_SEEDS || '1'),
    };

    public static lidarr = {
        url: process.env.LIDARR_URL,
        apiKey: process.env.LIDARR_KEY,
        apiPath: process.env.LIDARR_PATH || '/api/v1',
        categories: [3000, 3010, 3020, 3030, 3040, 8000],
        seeds: parseInt(process.env.LIDARR_MIN_SEEDS || '1'),
    };

    public static readarr = {
        url: process.env.READARR_URL,
        apiKey: process.env.READARR_KEY,
        apiPath: process.env.READARR_PATH || '/api/v1',
        categories: [3000, 3010, 3030, 3050, 7000, 7020, 8010, 8000],
        seeds: parseInt(process.env.READARR_MIN_SEEDS || '1'),
    };

    public static indexSpecificRules = [
        new IndexSpecificRule(Services.ALL, 'limetorrents', 8000, 146065),
        new IndexSpecificRule(Services.ALL, '7torrents', 8000, undefined),
        new IndexSpecificRule(Services.ALL, 'btdb', 8000, undefined),
        new IndexSpecificRule(Services.SONARR, 'tokyotosho', undefined, 100001),
        new IndexSpecificRule(Services.SONARR, 'nyaa-pantsu', undefined, 116972),
        new IndexSpecificRule(Services.SONARR, 'nyaa-pantsu', undefined, 135594),
        new IndexSpecificRule(Services.SONARR, 'nyaa-pantsu', undefined, 152237),
        new IndexSpecificRule(Services.SONARR, 'nyaasi', undefined, 127720),
    ];
}
