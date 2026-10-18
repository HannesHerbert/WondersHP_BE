// Einstiegspunkt des Backends (lokal via `npm run dev`, auf dem Server via `npm start`)
import express from 'express';
import config from './config/index.js';
import { createApiRouter, initBackend } from './app.js';

const app = express();

// Nur lokale Proxys vertrauen (Vite-Proxy, Reverse-Proxy auf demselben Server): req.ip ist dann die Besucher-IP
app.set('trust proxy', 'loopback, linklocal, uniquelocal');

// API
app.use(config.apiPrefix || '/', createApiRouter());

// Hochgeladene Medien (Bilder, Videos, Audio, Dokumente)
app.use(config.mediaPrefix, express.static(config.paths.storage, { index: false }));

await initBackend();

app.listen(config.port, () => {
    console.log(`[api] Server läuft auf http://localhost:${config.port}${config.apiPrefix}`);
});
