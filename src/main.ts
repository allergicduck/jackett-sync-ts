import * as dotenv from "dotenv";
dotenv.config();

import {Jackett} from "./jackett";
import {Config} from "./Config";
import { Sonarr } from './services/sonarr';
import { Radarr } from './services/radarr';
import { Lidarr } from './services/lidarr';

async function sync() {
	try {
		const jackett = new Jackett(Config.jackett.url, Config.jackett.apiKey, Config.jackett.altUrl);
		const indexers = await jackett.get();

		const idList = indexers.map(el => el.id);

		const sonarr = new Sonarr(Config.sonarr.url, Config.sonarr.apiKey);
		const sonarrIndexers = await sonarr.get()

		const sonarrIdList = sonarrIndexers.map((indexer) => indexer.id)

		const diff = idList.filter((id) => !sonarrIdList.includes(id));
		const toBeAdded = diff.map((indexersId) => sonarr.shouldAdd(indexers.find((indexer) => indexer.id == indexersId)))

	} catch (e) {
		console.error(e);
	}	
}

sync();