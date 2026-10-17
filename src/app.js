import express, { Router } from 'express';
import cors from 'cors';
import config from './config/index.js';
import routes from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { ensureStorageDirs } from './services/storage.service.js';
import { initDatabase } from './db/index.js';

/**
 * Baut den kompletten API-Router (Middleware, Routen, Fehlerbehandlung).
 * Wird vom Einstiegspunkt src/index.js eingebunden.
 */
export function createApiRouter() {
    const api = Router();

    api.use(cors({ origin: config.corsOrigin }));
    api.use(express.json({ limit: config.jsonLimit }));
    if (!config.isProduction) api.use(requestLogger);

    api.use(routes);

    api.use(notFoundHandler);
    api.use(errorHandler);

    return api;
}

/** Einmalige Initialisierung: Verzeichnisse, Datenbank, Konfigurations-Warnungen. */
export async function initBackend() {
    ensureStorageDirs();

    if (!config.auth.jwtSecret) {
        console.warn('[config] JWT_SECRET fehlt – Login ist nicht möglich.');
    }
    if (!config.auth.adminProtected) {
        console.warn('[config] Admin-Routen sind UNGESCHÜTZT (ADMIN_AUTH != true).');
    }

    return initDatabase();
}
