import { Image, Video } from '../models/index.js';
import config from '../config/index.js';
import HttpError from '../utils/HttpError.js';
import { toImageUrls } from '../utils/serializers.js';
import {
  detectMediaType,
  processImage,
  storeVideo,
  removeImageFiles,
  removeFile,
  listPublicFiles,
} from '../services/media.service.js';

const { paths, media } = config;

/** Ausschnitt aus dem Upload-Dialog (JSON, Prozentwerte) prüfen; ungültig oder fehlend = ganzes Bild */
function parseCrop(raw) {
  if (!raw) return undefined;
  try {
    const { x, y, width, height } = JSON.parse(raw);
    const values = [x, y, width, height].map(Number);
    if (values.some((v) => !Number.isFinite(v) || v < 0 || v > 100)) return undefined;
    if (values[2] < 1 || values[3] < 1) return undefined;
    // Ganzes Bild gewählt → nicht zuschneiden
    if (values[2] >= 99.9 && values[3] >= 99.9) return undefined;
    return { x: values[0], y: values[1], width: values[2], height: values[3] };
  } catch {
    return undefined;
  }
}

export async function uploadMedia(req, res) {
  const { file } = req;
  if (!file) throw HttpError.badRequest('Keine Datei hochgeladen');

  const type = detectMediaType(file.originalname);
  const title = req.body.title || 'Ohne Titel';
  const description = req.body.description || '';

  try {
    if (type === 'image') {
      const sources = await processImage(file.path, req.body.title, { crop: parseCrop(req.body.crop) });
      const image = await Image.create({ ...sources, title, description });
      return res.json({ success: true, type, imageId: image.id, files: Object.values(sources) });
    }

    if (type === 'video') {
      const sourceUrl = await storeVideo(file.path, file.originalname, req.body.title);
      const video = await Video.create({ sourceUrl, title, description, usage: null });
      return res.json({ success: true, type, videoId: video.id, file: sourceUrl });
    }

    throw HttpError.badRequest('Nicht unterstütztes Dateiformat');
  } finally {
    // Temporäre Upload-Datei in jedem Fall aufräumen
    await removeFile(file.path);
  }
}

/** Öffentliche Galerie: nur freigegebene Bilder, in der Reihenfolge des Imports/Uploads */
export async function getGalleryImages(req, res) {
  const images = await Image.findAll({ where: { isPublic: true }, order: [['id', 'ASC']] });
  res.json({
    success: true,
    data: images.map((image) => ({
      id: image.id,
      title: image.title,
      description: image.description,
      images: toImageUrls(image),
    })),
  });
}

/** Öffentliche Videos (für Startseite und Galerie) */
export async function getPublicVideos(req, res) {
  const videos = await Video.findAll({ order: [['id', 'ASC']] });
  res.json({
    success: true,
    data: videos.map(({ id, sourceUrl, title, description, usage }) => ({ id, sourceUrl, title, description, usage })),
  });
}

export async function getAllImages(req, res) {
  const images = await Image.findAll({ order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: images });
}

export async function getAllVideos(req, res) {
  const videos = await Video.findAll({ order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: videos });
}

export async function getAllAudioFiles(req, res) {
  const data = await listPublicFiles(paths.audio, media.audioPattern, `${config.mediaPrefix}/audio`);
  res.json({ success: true, data });
}

export async function getAllDocuments(req, res) {
  const data = await listPublicFiles(paths.documents, media.documentPattern, `${config.mediaPrefix}/documents`);
  res.json({ success: true, data });
}

async function findImageOrFail(id) {
  const image = await Image.findByPk(id);
  if (!image) throw HttpError.notFound('Bild nicht gefunden');
  return image;
}

export async function updateImage(req, res) {
  const image = await findImageOrFail(req.params.id);
  const { title, description, isPublic } = req.body;

  await image.update({
    title: title || image.title,
    description: description || image.description,
    // Sichtbarkeit in der öffentlichen Galerie
    ...(typeof isPublic === 'boolean' ? { isPublic } : {}),
  });

  res.json({ success: true, data: image });
}

export async function deleteImage(req, res) {
  const image = await findImageOrFail(req.params.id);

  await image.destroy();
  await removeImageFiles(image);

  res.json({ success: true, message: 'Bild erfolgreich gelöscht' });
}
