import * as dotenv from 'dotenv';

dotenv.config();

import { Jackett } from './services/jackett';
import { Sonarr } from './services/sonarr';
import { Radarr } from './services/radarr';
import { Lidarr } from './services/lidarr';
import { Readarr } from './services/readarr';
import { Service } from './services/service';
import { JackettIndexer } from './models/jackettIndexer';

async function start() {
    let jackettIndexers: JackettIndexer[];
    try {
        const jackett = new Jackett();
        jackettIndexers = await jackett.getIndexers();
    } catch (error) {
        console.error(`[${Jackett.name}] Couldn't get indexers: `, (error as Error).message);
        process.exit(1);
    }

    try {
        const sonarr = new Sonarr();
        sync(sonarr, jackettIndexers);
    } catch (error) {
        console.error(`[${Sonarr.name}] Failed:`, (error as Error).message);
    }

    try {
        const radarr = new Radarr();
        sync(radarr, jackettIndexers);
    } catch (error) {
        console.error(`[${Radarr.name}] Failed:`, (error as Error).message);
    }

    try {
        const lidarr = new Lidarr();
        sync(lidarr, jackettIndexers);
    } catch (error) {
        console.error(`[${Lidarr.name}] Failed:`, (error as Error).message);
    }

    try {
        const readarr = new Readarr();
        sync(readarr, jackettIndexers);
    } catch (error) {
        console.error(`[${Readarr.name}] Failed:`, (error as Error).message);
    }
}

function sync(service: Service, jackettIndexers: JackettIndexer[]) {
    return service.validate()
        .then((response) => {
            console.log(`[${service.service}] Tested url & apiKey, running version ${response.data.version}`);
            return service.getIndexers();
        })
        .then(() => {
            console.log(`[${service.service}] Starting sync`);
            return service.sync(jackettIndexers);
        })
        .then(() => {
            console.log(`[${service.service}] Sync is done!`);
        })
        .catch((error) => {
            console.error(`[${service.service}] Failed:`, error.message);
        });
}

start();