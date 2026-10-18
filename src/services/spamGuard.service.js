import crypto from 'crypto';
import config from '../config/index.js';

// Unsichtbarer Spamschutz fürs Kontaktformular – ohne Drittanbieter:
// signiertes Zeit-Token (Formular muss geladen und nicht in Sekundenbruchteilen abgeschickt werden),
// Rate-Limit pro IP (nur im Speicher) und einfache Inhaltsprüfung. Der Honeypot wird im Controller geprüft.

const MIN_FILL_MS = 3_000;
const MAX_TOKEN_AGE_MS = 2 * 60 * 60 * 1000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;
const MAX_LINKS = 3;

// Ohne JWT_SECRET ein Zufallsschlüssel pro Prozess (Tokens gelten dann bis zum Neustart)
const secret = config.auth.jwtSecret || crypto.randomBytes(32).toString('hex');

const sign = (value) => crypto.createHmac('sha256', `contact:${secret}`).update(value).digest('base64url');

/** Token mit Ausstellungszeit, das das Formular beim Laden holt */
export function issueFormToken() {
  const issuedAt = Date.now().toString(36);
  return `${issuedAt}.${sign(issuedAt)}`;
}

/** @returns {'ok' | 'invalid' | 'too-fast' | 'expired'} */
export function checkFormToken(token) {
  const [issuedAt, signature] = String(token || '').split('.');
  if (!issuedAt || !signature) return 'invalid';

  const expected = Buffer.from(sign(issuedAt));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return 'invalid';

  const age = Date.now() - parseInt(issuedAt, 36);
  if (age < MIN_FILL_MS) return 'too-fast';
  if (age > MAX_TOKEN_AGE_MS) return 'expired';
  return 'ok';
}

const hits = new Map();

/** true, wenn diese IP im Zeitfenster schon zu viele Anfragen geschickt hat */
export function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

// Speicher gelegentlich aufräumen
setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of hits) {
    if (times.every((time) => now - time >= RATE_WINDOW_MS)) hits.delete(ip);
  }
}, RATE_WINDOW_MS).unref();

/** Typisches Spam-Merkmal: viele Links in der Nachricht */
export function looksLikeSpam(text) {
  const links = String(text).match(/https?:\/\/|www\./gi) || [];
  return links.length > MAX_LINKS;
}
