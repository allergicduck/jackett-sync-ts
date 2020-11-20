import { SonarrEntry } from './interfaces/SonarrEntry';
import { RadarrEntry } from './interfaces/RadarrEntry';
import { LidarrEntry } from './interfaces/LidarrEntry';
import { ReaderrEntry } from './interfaces/ReaderrEntry';

function arrayEquals<T>(arr1?: T[], arr2?: T[]) {
    if(!arr1 || !arr2) {
        return false;
    }
    return arr1.length === arr2.length && !arr1.some((v) => arr2.indexOf(v) < 0) && !arr2.some((v) => arr1.indexOf(v) < 0);
}

type Entry = SonarrEntry | RadarrEntry | LidarrEntry | ReaderrEntry;

export { arrayEquals, Entry };