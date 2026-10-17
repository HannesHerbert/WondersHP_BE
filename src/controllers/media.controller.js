import { Image, Video } from '../models/index.js';
import config from '../config/index.js';
import HttpError from '../utils/HttpError.js';
import {
  detectMediaType,
  processImage,
  storeVideo,
  removeImageFiles,
  removeFile,
  listPublicFiles,
} from '../services/media.service.js';

const { paths, media } = config;

export async function uploadMedia(req, res) {
  const { file } = req;
  if (!file) throw HttpError.badRequest('Keine Datei hochgeladen');

  const type = detectMediaType(file.originalname);
  const title = req.body.title || 'Ohne Titel';
  const description = req.body.description || '';

  try {
    if (type === 'image') {
      const sources = await processImage(file.path, req.body.title);
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
  const { title, description } = req.body;

  await image.update({
    title: title || image.title,
    description: description || image.description,
  });

  res.json({ success: true, data: image });
}

export async function deleteImage(req, res) {
  const image = await findImageOrFail(req.params.id);

  await image.destroy();
  await removeImageFiles(image);

  res.json({ success: true, message: 'Bild erfolgreich gelöscht' });
}
