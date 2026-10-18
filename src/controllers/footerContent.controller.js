import { Setting } from '../models/index.js';
import HttpError from '../utils/HttpError.js';
import { DEFAULT_DATENSCHUTZ, DEFAULT_IMPRESSUM } from '../content/legalDefaults.js';

// Content → Footer: Kontaktangaben im Footer und die Texte für Datenschutz und Impressum
const KEYS = {
  email: 'footer.email',
  phone: 'footer.phone',
  datenschutz: 'legal.datenschutz',
  impressum: 'legal.impressum',
};

// Startwerte = bisheriger Footer; null in der DB heißt "nie gespeichert", '' heißt "bewusst leer"
const DEFAULTS = {
  email: 'ulrich.dobe@gmx.de',
  phone: '0174 – 12 34 567',
  datenschutz: DEFAULT_DATENSCHUTZ,
  impressum: DEFAULT_IMPRESSUM,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_TEXT = 60000;

async function readAll() {
  const rows = await Setting.findAll({ where: { key: Object.values(KEYS) } });
  const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return Object.fromEntries(
    Object.entries(KEYS).map(([field, key]) => [field, stored[key] ?? DEFAULTS[field]])
  );
}

export async function getFooterContent(req, res) {
  const { email, phone } = await readAll();
  res.json({ success: true, data: { email, phone } });
}

export async function getLegalPage(req, res) {
  const page = req.params.page;
  if (!['datenschutz', 'impressum'].includes(page)) throw HttpError.notFound('Seite nicht gefunden');
  const content = (await readAll())[page];
  res.json({ success: true, data: { page, content } });
}

/** Alles für den Dashboard-Editor */
export async function getFooterAdmin(req, res) {
  res.json({ success: true, data: await readAll() });
}

export async function updateFooterContent(req, res) {
  const email = String(req.body.email ?? '').trim();
  const phone = String(req.body.phone ?? '').trim();
  const datenschutz = String(req.body.datenschutz ?? '');
  const impressum = String(req.body.impressum ?? '');

  if (email && !EMAIL_PATTERN.test(email)) throw HttpError.badRequest('Bitte eine gültige E-Mail-Adresse angeben (oder leer lassen).');
  if (phone && !/\d{4,}/.test(phone.replace(/\D/g, ''))) throw HttpError.badRequest('Die Telefonnummer enthält zu wenige Ziffern.');
  if (datenschutz.length > MAX_TEXT || impressum.length > MAX_TEXT) throw HttpError.badRequest('Ein Text ist zu lang.');

  const values = { email, phone, datenschutz, impressum };
  await Promise.all(Object.entries(KEYS).map(([field, key]) => Setting.upsert({ key, value: values[field] })));
  return getFooterAdmin(req, res);
}
