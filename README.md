# Jackett-Sync-TS

Sync all [Jackett](https://github.com/Jackett/Jackett) indexers to [Sonarr](https://github.com/Sonarr/Sonarr), [Radarr](https://github.com/Radarr/Radarr), [Lidarr](https://github.com/lidarr/Lidarr) and [Readarr](https://github.com/Readarr/Readarr).

## Install

### Docker

An image is available at [allergicduck/jackett-sync](https://hub.docker.com/r/allergicduck/jackett-sync)

## Usage

- Clone repo / use Docker
- `npm install`
- `cp .env-example .env`
- `npm start`
- Jackett is required, all others are optional.

## Versions

Confirmed working versions:

- Sonarr: 3.0.6.1265
- Radarr: 3.2.2.5080
- Lidarr: 0.8.1.2135
- Readerr: 0.1.0.736

## Config

```dotenv
LIDARR_URL=http://lidarr:8787
LIDARR_KEY=yourApiKeyHere

RADARR_URL=http://radarr:8787
RADARR_KEY=yourApiKeyHere

SONARR_URL=http://sonarr:8787
SONARR_KEY=yourApiKeyHere

READARR_URL=http://readarr:8787
READARR_KEY=yourApiKeyHere

JACKETT_URL=http://jackett:9117
JACKETT_ALTURL=http://localhost:9117
JACKETT_KEY=yourApiKeyHere
```

## Credits

This project was forked from [Łukasz Mariański](https://github.com/lmarianski/jackett-sync), and adjusted to my likings.
While not much of his code is left, the logic and information is taken from him.
