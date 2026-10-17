import { BookingTeaser, Image } from '../models/index.js';
import { serializeBookingTeaser, emptyToNull } from '../utils/serializers.js';
import { createFocusDetail, removeFile } from '../services/media.service.js';
import config from '../config/index.js';
import path from 'path';

const withImage = { include: [{ model: Image, as: 'image' }] };

const clampPercent = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(Math.max(number, 0), 100) : fallback;
};

/** Es gibt genau einen Teaser-Eintrag – wird bei Bedarf mit Standardwerten angelegt. */
async function getOrCreateBookingTeaser() {
  const teaser = await BookingTeaser.findOne(withImage);
  return teaser ?? BookingTeaser.create(BookingTeaser.DEFAULTS);
}

// Detail-Ebenen: Ausschnittsbreite (Anteil am Bild), Hochskalierung und Zoombereich, in dem sie einblendet
const DETAIL_LEVELS = [
  { share: 0.25, scale: 5, from: 2, to: 3.5 },
  { share: 0.08, scale: 14, from: 7, to: 10 },
];

const parseLayers = (json) => {
  try {
    return JSON.parse(json || '[]');
  } catch {
    return [];
  }
};

/** Erzeugt die scharfen Detail-Ebenen um den Zoompunkt neu (alte Dateien werden gelöscht). */
export async function refreshFocusDetail(teaser) {
  const previous = parseLayers(teaser.detailLayers);
  const layers = [];

  if (teaser.image?.sourceUrlLG) {
    for (const { share, scale, from, to } of DETAIL_LEVELS) {
      const { filename, rect } = await createFocusDetail(teaser.image.sourceUrlLG, teaser.focusX, teaser.focusY, { share, scale });
      layers.push({ file: filename, ...rect, from, to });
    }
  }

  await teaser.update({ detailLayers: layers.length ? JSON.stringify(layers) : null });
  await Promise.all(previous.map((layer) => removeFile(path.join(config.paths.images, layer.file))));
}

export async function getBookingTeaser(req, res) {
  const teaser = await getOrCreateBookingTeaser();
  res.json({ success: true, data: serializeBookingTeaser(teaser) });
}

export async function updateBookingTeaser(req, res) {
  const { title, image_id, focusX, focusY } = req.body;
  const teaser = await getOrCreateBookingTeaser();

  await teaser.update({
    title,
    image_id: emptyToNull(image_id),
    focusX: clampPercent(focusX, teaser.focusX),
    focusY: clampPercent(focusY, teaser.focusY),
  });
  await teaser.reload(withImage);
  await refreshFocusDetail(teaser);

  res.json({ success: true, data: serializeBookingTeaser(teaser) });
}
