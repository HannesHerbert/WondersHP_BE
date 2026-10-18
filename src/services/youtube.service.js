import axios from 'axios';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import config from '../config/index.js';
import HttpError from '../utils/HttpError.js';

// YouTube-Videos: ID aus der URL lesen, Titel per oEmbed, Vorschaubild einmalig lokal speichern.
// So lädt die Website vor dem Klick auf "Abspielen" nichts von YouTube (Datenschutz).

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/** Akzeptiert watch?v=, youtu.be/, /shorts/, /embed/, /live/ und die reine ID */
export function parseYouTubeId(input) {
  const value = String(input || '').trim();
  if (ID_PATTERN.test(value)) return value;

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, '');
  let id = null;
  if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
  else if (['youtube.com', 'youtube-nocookie.com'].includes(host)) {
    id = url.searchParams.get('v');
    const match = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/);
    if (!id && match) id = match[1];
  }
  return id && ID_PATTERN.test(id) ? id : null;
}

export const canonicalUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

/** Titel und Kanal über die öffentliche oEmbed-Schnittstelle (ohne API-Schlüssel) */
export async function fetchYouTubeInfo(id) {
  try {
    const { data } = await axios.get('https://www.youtube.com/oembed', {
      params: { url: canonicalUrl(id), format: 'json' },
      timeout: 6000,
    });
    return { title: data.title, author: data.author_name };
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 401) {
      throw HttpError.badRequest('Dieses YouTube-Video gibt es nicht oder es darf nicht eingebettet werden.');
    }
    return null; // Netzwerkproblem: ohne Titel weitermachen
  }
}

/** Vorschaubild herunterladen (beste verfügbare Größe) und als WebP in den Bilder-Ordner legen */
export async function storeYouTubePoster(id) {
  for (const name of ['maxresdefault', 'sddefault', 'hqdefault']) {
    try {
      const { data } = await axios.get(`https://i.ytimg.com/vi/${id}/${name}.jpg`, { responseType: 'arraybuffer', timeout: 8000 });
      const filename = `${crypto.randomUUID()}_yt_${id}.webp`;
      await sharp(Buffer.from(data)).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 85 }).toFile(path.join(config.paths.images, filename));
      return filename;
    } catch {
      // nächste Größe probieren (maxres gibt es nicht bei jedem Video)
    }
  }
  return null;
}
