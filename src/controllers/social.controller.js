import { Setting } from '../models/index.js';
import HttpError from '../utils/HttpError.js';

// Social-Media-Links für den Header; leer = Icon wird nicht gezeigt
const NETWORKS = ['youtube', 'instagram', 'facebook'];
const keyOf = (network) => `social.${network}`;

async function readLinks() {
  const rows = await Setting.findAll({ where: { key: NETWORKS.map(keyOf) } });
  const byKey = Object.fromEntries(rows.map((row) => [row.key, row.value || '']));
  return Object.fromEntries(NETWORKS.map((network) => [network, byKey[keyOf(network)] || '']));
}

/** Nur http(s)-Adressen; ohne Protokoll wird https:// ergänzt */
function normalizeUrl(value, network) {
  const url = String(value || '').trim();
  if (!url) return '';
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const parsed = new URL(withProtocol);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    return parsed.toString();
  } catch {
    throw HttpError.badRequest(`Ungültiger Link für ${network}`);
  }
}

export async function getSocialLinks(req, res) {
  res.json({ success: true, data: await readLinks() });
}

export async function updateSocialLinks(req, res) {
  const entries = NETWORKS.map((network) => [network, normalizeUrl(req.body?.[network], network)]);
  await Promise.all(entries.map(([network, value]) => Setting.upsert({ key: keyOf(network), value })));
  res.json({ success: true, data: await readLinks() });
}
