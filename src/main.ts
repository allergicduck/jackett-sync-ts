import * as dotenv from 'dotenv';

dotenv.config();

import { Jackett } from './jackett';
import { Config } from './Config';
import { Sonarr } from './services/sonarr';
import { Radarr } from './services/radarr';
import { Lidarr } from './services/lidarr';
import { Service } from './services/service';
import { Indexer } from './models/indexer';

async function sync() {
    try {
        const jackett = new Jackett(Config.jackett.url, Config.jackett.apiKey, Config.jackett.altUrl);
        const jackettIndexers = await jackett.get();

        const sonarr = new Sonarr(Config.sonarr.url, Config.sonarr.apiKey, Config.sonarr.categories, Config.sonarr.animeCategories, Config.sonarr.seeds);
        const sonarrIndexers = await sonarr.get();

        const toBeAddedIndexers = compareIndexers(jackettIndexers, sonarrIndexers, sonarr);
        toBeAddedIndexers.map((indexer) => sonarr.add(indexer));
    } catch (e) {
        console.error(e);
    }
}

function compareIndexers(jackettIndexers: Indexer[], serviceIndexers: Indexer[], service: Service): Indexer[] {
    const idList = jackettIndexers.map(el => el.id);
    const serviceIdList = serviceIndexers.map((indexer) => indexer.id);
    const diff = idList.filter((id) => !serviceIdList.includes(id));
    return diff.map((indexersId) => {
        const indexer = jackettIndexers.find((indexer) => indexer.id == indexersId);
        if (service.shouldAdd(indexer)) {
            return indexer;
        }
    }).filter(exists => exists);
}

sync();