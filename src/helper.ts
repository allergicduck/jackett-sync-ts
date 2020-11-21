import { SonarrEntry } from './interfaces/SonarrEntry';
import { RadarrEntry } from './interfaces/RadarrEntry';
import { LidarrEntry } from './interfaces/LidarrEntry';
import { ReadarrEntry } from './interfaces/ReadarrEntry';

function arrayEquals<T>(arr1?: T[], arr2?: T[]) {
    if (!arr1 || !arr2) {
        return false;
    }
    return arr1.length === arr2.length && !arr1.some((v) => arr2.indexOf(v) < 0) && !arr2.some((v) => arr1.indexOf(v) < 0);
}

const IndexerRegex = /.*\/api\/v2.0\/indexers\/(?<id>.*)\/results\/torznab\//;

function getIdFromIndexerUrl(url: string): string | undefined {
    let id: string | undefined;
    let match = url.match(IndexerRegex);
    if (match && match.groups) {
        id = match.groups.id;
    }
    return id;
}

type Entry = SonarrEntry | RadarrEntry | LidarrEntry | ReadarrEntry;

export { arrayEquals, Entry, getIdFromIndexerUrl };