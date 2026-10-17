import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import HttpError from '../utils/HttpError.js';

/** Prüft das Bearer-Token und legt den Payload unter `req.tokenPayload` ab. */
export function requireAuth(req, res, next) {
    const [scheme, token] = (req.headers.authorization || '').split(' ');

    if (scheme !== 'Bearer' || !token) {
        return next(HttpError.unauthorized('Token fehlt'));
    }

    if (!config.auth.jwtSecret) {
        return next(new HttpError(500, 'JWT_SECRET ist nicht konfiguriert'));
    }

    jwt.verify(token, config.auth.jwtSecret, (err, payload) => {
        if (err) return next(HttpError.unauthorized('Ungültiges Token'));
        req.tokenPayload = payload;
        next();
    });
}

/** Schutz für Admin-Routen – per ADMIN_AUTH=true aktivierbar. */
export const requireAdmin = config.auth.adminProtected
    ? requireAuth
    : (req, res, next) => next();
