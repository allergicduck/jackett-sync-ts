import * as dotenv from 'dotenv';

dotenv.config();

import { Jackett } from './jackett';
import { Sonarr } from './services/sonarr';
import { Radarr } from './services/radarr';
import { Lidarr } from './services/lidarr';
import { Service } from './services/service';
import { JackettIndexer } from './models/jackettIndexer';

async function start() {
    const jackett = new Jackett();
    const lidarr = new Lidarr(), sonarr = new Sonarr(), radarr = new Radarr();

    try {
        jackett.validate();
    } catch (error) {

    }

    const jackettIndexers = await jackett.getIndexers();

    sync(lidarr, jackettIndexers);
    sync(sonarr, jackettIndexers);
    sync(radarr, jackettIndexers);
}

function sync(service: Service, jackettIndexers: JackettIndexer[]) {
    return service.validate()
        .then((response) => {
            console.log(`[${service.name}] Tested url & apiKey, running version ${response.data.version}`);
            return service.getIndexers();
        })
        .then(() => {
            console.log(`[${service.name}] Starting sync`);
            return service.sync(jackettIndexers);
        })
        .catch((error) => {
            console.error(`[${service.name}] Failed:`, error.message);
        });
}

start();