import { Setting, Image, Video } from '../models/index.js';
import config from '../config/index.js';
import HttpError from '../utils/HttpError.js';
import { toImageUrls } from '../utils/serializers.js';
import { listPublicFiles } from '../services/media.service.js';

// Seiteninhalte, die im Dashboard unter "Content" gepflegt werden und keine eigene Tabelle brauchen

const LOGO_KEY = 'header.logoImageId';
const MEDIA_KEY = 'media.content';

// Bisherige Hörproben als Standard, solange im Dashboard nichts gespeichert ist
const DEFAULT_TRACKS = [
  { file: 'use me.mp3', title: 'Use Me', original: 'Bill Withers' },
  { file: 'superstition.mp3', title: 'Superstition', original: 'Stevie Wonder' },
  { file: 'Aint nobody.mp3', title: "Ain't Nobody", original: 'Rufus & Chaka Khan' },
];

async function readSetting(key) {
  const row = await Setting.findByPk(key);
  return row?.value ?? null;
}

const toId = (value) => (value === '' || value == null ? null : Number(value));

async function imageOrFail(id) {
  if (id == null) return null;
  const image = await Image.findByPk(id);
  if (!image) throw HttpError.badRequest('Bild nicht gefunden');
  return image;
}

// ─── Header ─────────────────────────────────────────────────────────────────

export async function getHeaderContent(req, res) {
  const id = toId(await readSetting(LOGO_KEY));
  const image = id ? await Image.findByPk(id) : null;
  res.json({
    success: true,
    data: { logoImageId: image ? image.id : null, logo: image ? { title: image.title, images: toImageUrls(image) } : null },
  });
}

export async function updateHeaderContent(req, res) {
  const image = await imageOrFail(toId(req.body.logoImageId));
  await Setting.upsert({ key: LOGO_KEY, value: image ? String(image.id) : null });
  return getHeaderContent(req, res);
}

// ─── Medien (Startseite) ────────────────────────────────────────────────────

async function readMediaContent() {
  let stored = {};
  try {
    stored = JSON.parse((await readSetting(MEDIA_KEY)) || '{}');
  } catch {
    stored = {};
  }
  return {
    coverImageId: toId(stored.coverImageId),
    videoId: toId(stored.videoId),
    tracks: Array.isArray(stored.tracks) ? stored.tracks : DEFAULT_TRACKS,
  };
}

/** Öffentliche Sicht: Cover, Titel mit URL, Video – mit sinnvollen Rückfallwerten */
export async function getMediaContent(req, res) {
  const content = await readMediaContent();

  // Gewähltes Cover/Video inzwischen gelöscht → wie "Automatisch" behandeln
  const cover = (content.coverImageId && await Image.findByPk(content.coverImageId))
    || await Image.findOne({ where: { isPublic: true }, order: [['id', 'ASC']] });
  const video = (content.videoId && await Video.findByPk(content.videoId))
    || await Video.findOne({ order: [['id', 'ASC']] });

  res.json({
    success: true,
    data: {
      coverImageId: content.coverImageId,
      videoId: content.videoId,
      cover: cover ? { title: cover.title, images: toImageUrls(cover) } : null,
      tracks: content.tracks.map((track) => ({ ...track, url: `${config.mediaPrefix}/audio/${track.file}` })),
      video: video ? Video.serialize(video) : null,
    },
  });
}

export async function updateMediaContent(req, res) {
  const { coverImageId, videoId, tracks } = req.body;

  await imageOrFail(toId(coverImageId));
  if (toId(videoId) != null && !(await Video.findByPk(toId(videoId)))) throw HttpError.badRequest('Video nicht gefunden');

  if (!Array.isArray(tracks)) throw HttpError.badRequest('Titelliste fehlt');
  const available = new Set(
    (await listPublicFiles(config.paths.audio, config.media.audioPattern, '')).map((file) => file.filename)
  );
  const cleanTracks = tracks.map((track) => {
    const file = String(track.file || '');
    if (!available.has(file)) throw HttpError.badRequest(`Audiodatei nicht gefunden: ${file}`);
    const title = String(track.title || '').trim();
    if (!title) throw HttpError.badRequest('Jeder Demotitel braucht einen Namen');
    return { file, title, original: String(track.original || '').trim() };
  });

  const value = JSON.stringify({ coverImageId: toId(coverImageId), videoId: toId(videoId), tracks: cleanTracks });
  await Setting.upsert({ key: MEDIA_KEY, value });
  return getMediaContent(req, res);
}
