import * as dotenv from 'dotenv';

dotenv.config();

import { Jackett } from './jackett';
import { Sonarr } from './services/sonarr';
import { Radarr } from './services/radarr';
import { Lidarr } from './services/lidarr';

async function sync() {
    const jackett = new Jackett();
    const jackettIndexers = await jackett.get();

    const lidarr = new Lidarr(), sonarr = new Sonarr(), radarr = new Radarr();

    lidarr.getIndexers().then(() => lidarr.sync(jackettIndexers)).catch(() => {
        console.error(`[Lidarr] Failed`)
    });

    sonarr.getIndexers().then(() => sonarr.sync(jackettIndexers)).catch(() => {
        console.error(`[Sonarr] Failed`)
    });

    radarr.getIndexers().then(() => radarr.sync(jackettIndexers)).catch(() => {
        console.error(`[Radarr] Failed`)
    });


}

sync();