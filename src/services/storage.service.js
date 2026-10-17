import fs from 'fs';
import config from '../config/index.js';

/** Legt alle benötigten Upload-Verzeichnisse an (einmalig beim Start). */
export function ensureStorageDirs() {
    const { storage, images, videos, tmp, audio, documents } = config.paths;
    for (const dir of [storage, images, videos, tmp, audio, documents]) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
