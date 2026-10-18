import { ContactRequest } from '../models/index.js';
import HttpError from '../utils/HttpError.js';
import { issueFormToken, checkFormToken, isRateLimited, looksLikeSpam } from '../services/spamGuard.service.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { name: 120, email: 254, message: 5000 };

export function getContactToken(req, res) {
  res.json({ success: true, token: issueFormToken() });
}

export async function createContactRequest(req, res) {
  const { name = '', email = '', message = '', website = '', token } = req.body;

  // Honeypot: Menschen sehen das Feld nicht. Bots bekommen eine Erfolgsmeldung, gespeichert wird nichts.
  if (String(website).trim()) return res.status(201).json({ success: true });

  const tokenState = checkFormToken(token);
  if (tokenState === 'too-fast') throw HttpError.badRequest('Das ging sehr schnell – bitte schick die Nachricht in ein paar Sekunden noch einmal ab.');
  if (tokenState !== 'ok') throw HttpError.badRequest('Das Formular ist abgelaufen. Bitte lade die Seite neu und schick die Nachricht noch einmal ab.');

  if (isRateLimited(req.ip)) {
    throw new HttpError(429, 'Du hast gerade mehrere Nachrichten geschickt. Bitte versuch es in ein paar Minuten noch einmal.');
  }

  const data = { name: String(name).trim(), email: String(email).trim(), message: String(message).trim() };
  if (!data.name || data.name.length > LIMITS.name) throw HttpError.badRequest('Bitte gib deinen Namen an.');
  if (!EMAIL_PATTERN.test(data.email) || data.email.length > LIMITS.email) throw HttpError.badRequest('Bitte gib eine gültige E-Mail-Adresse an.');
  if (data.message.length < 5) throw HttpError.badRequest('Bitte schreib uns eine kurze Nachricht.');
  if (data.message.length > LIMITS.message) throw HttpError.badRequest(`Die Nachricht ist zu lang (höchstens ${LIMITS.message} Zeichen).`);

  // Wie beim Honeypot: still verwerfen, damit Spammer nicht lernen, was auffällt
  if (looksLikeSpam(data.message)) return res.status(201).json({ success: true });

  await ContactRequest.create(data);
  res.status(201).json({ success: true });
}

export async function getContactRequests(req, res) {
  const requests = await ContactRequest.findAll({ order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: requests });
}

export async function updateContactRequest(req, res) {
  const request = await ContactRequest.findByPk(req.params.id);
  if (!request) throw HttpError.notFound('Anfrage nicht gefunden');

  const { status } = req.body;
  if (!ContactRequest.STATUSES.includes(status)) throw HttpError.badRequest('Unbekannter Status');

  await request.update({ status, answeredAt: status === 'answered' ? new Date() : request.answeredAt });
  res.json({ success: true, data: request });
}

export async function deleteContactRequest(req, res) {
  const deleted = await ContactRequest.destroy({ where: { id: req.params.id } });
  if (!deleted) throw HttpError.notFound('Anfrage nicht gefunden');
  res.json({ success: true });
}
