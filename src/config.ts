export class Config {
    public static jackett = {
        url: process.env.JACKETT_URL,
        altUrl: process.env.JACKETT_ALTURL,
        apiKey: process.env.JACKETT_APIKEY,
    };

    public static sonarr = {
        url: process.env.SONARR_URL,
        apiKey: process.env.SONARR_APIKEY,
        categories: [5000, 5030, 5040],
        animeCategories: [5070, 116972, 127720],
        seeds: 1,
    };

    public static radarr = {
        url: process.env.RADARR_URL,
        apiKey: process.env.RADARR_APIKEY,
        categories: [2000, 2010, 2020, 2030, 2035, 2040, 2045, 2050, 2060],
        animeCategories: [],
        seeds: 1,
    };

    public static lidarr = {
        url: process.env.LIDARR_URL,
        apiKey: process.env.LIDARR_APIKEY,
        categories: [3000, 3010, 3020, 3030, 3040],
        seeds: 1,
    };
}