import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import config from '../config/index.js';
import HttpError from '../utils/HttpError.js';

const SALT_ROUNDS = 10;

const toPublicUser = (user) => ({ id: user.id, username: user.username, email: user.email });

export async function loginUser(req, res) {
  const { username, password } = req.body;
  if (!username || !password) throw HttpError.badRequest('Benutzername und Passwort erforderlich');

  const user = await User.scope('withPassword').findOne({ where: { username } });
  const isValid = user && await bcrypt.compare(password, user.password);

  // Gleiche Antwort für unbekannten User und falsches Passwort – verrät keine Benutzernamen
  if (!isValid) throw HttpError.unauthorized('Ungültige Zugangsdaten');

  if (!config.auth.jwtSecret) throw new HttpError(500, 'JWT_SECRET ist nicht konfiguriert');

  const publicUser = toPublicUser(user);
  const token = jwt.sign(publicUser, config.auth.jwtSecret, { expiresIn: config.auth.tokenTtl });

  res.json({ user: publicUser, token });
}

export async function validateUser(req, res) {
  const user = await User.findByPk(req.tokenPayload.id);
  if (!user) throw HttpError.unauthorized('User existiert nicht mehr');

  res.json({ success: true, user: toPublicUser(user) });
}

export async function createUser(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw HttpError.badRequest('Benutzername, E-Mail und Passwort erforderlich');
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ username, email, password: hash });

  res.status(201).json(toPublicUser(user));
}
