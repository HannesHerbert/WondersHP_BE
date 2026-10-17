import axios from 'axios';
import config from '../config/index.js';
import HttpError from '../utils/HttpError.js';

const VERIFY_URL = 'https://hcaptcha.com/siteverify';

export async function verifyHCaptcha(req, res) {
  const { token } = req.body;
  if (!token) throw HttpError.badRequest('hCaptcha Token fehlt.');
  if (!config.hcaptchaSecret) throw new HttpError(500, 'HCAPTCHA_SECRET ist nicht konfiguriert');

  const { data } = await axios.post(VERIFY_URL, null, {
    params: { secret: config.hcaptchaSecret, response: token },
  });

  if (!data.success) throw HttpError.badRequest('hCaptcha Verifizierung fehlgeschlagen.');

  res.json({ success: true, message: 'hCaptcha erfolgreich validiert.' });
}
