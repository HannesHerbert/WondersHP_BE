import { Song } from '../models/index.js';
import HttpError from '../utils/HttpError.js';

const ORDER = [['position', 'ASC'], ['id', 'ASC']];

/** Formular → Felder; Titel und Interpret sind Pflicht */
function normalizeSong(data = {}) {
  const title = String(data.title || '').trim();
  const artist = String(data.artist || '').trim();
  if (!title) throw HttpError.badRequest('Titel fehlt');
  if (!artist) throw HttpError.badRequest('Interpret fehlt');
  return { title, artist };
}

export async function getPublicRepertoire(req, res) {
  const songs = await Song.findAll({ order: ORDER, attributes: ['id', 'title', 'artist'] });
  res.json({ success: true, data: songs });
}

export async function getSongs(req, res) {
  const songs = await Song.findAll({ order: ORDER });
  res.json({ success: true, data: songs });
}

export async function createSong(req, res) {
  // Neue Songs ans Ende der Liste
  const position = ((await Song.max('position')) ?? 0) + 1;
  const song = await Song.create({ ...normalizeSong(req.body), position });
  res.status(201).json({ success: true, data: song });
}

export async function updateSong(req, res) {
  const song = await Song.findByPk(req.params.id);
  if (!song) throw HttpError.notFound('Song nicht gefunden');

  const fields = normalizeSong({ ...song.toJSON(), ...req.body });
  if (Number.isInteger(Number(req.body.position))) fields.position = Number(req.body.position);
  await song.update(fields);
  res.json({ success: true, data: song });
}

export async function deleteSong(req, res) {
  const deleted = await Song.destroy({ where: { id: req.params.id } });
  if (!deleted) throw HttpError.notFound('Song nicht gefunden');
  res.json({ success: true });
}
