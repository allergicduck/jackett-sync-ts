export class Config {
    public static jackett = {
        url: "http://172.18.0.2:9117",
        apiKey: "z9ukkyubjmvzm8ey3jyxyywrva1py4cb",
        altUrl: "http://localhost:9117"
    }

    public static sonarr = {
        url: "http://172.18.0.2:8989",
        apiKey: "7d650afd0a574d1e8c1665c290c011b9",
        categories: [5000, 5030, 5040],
        animeCategories: [5070],
        seeds: 1,
    }

    public static radarr = {
        url: "http://172.18.0.2:8989",
        apiKey: "7d650afd0a574d1e8c1665c290c011b9",
        categories: [],
        seeds: 1,
    }

    public static lidarr = {
        url: "http://172.18.0.2:8989",
        apiKey: "7d650afd0a574d1e8c1665c290c011b9",
        categories: [],
        seeds: 1,
    }
}