// Einstiegspunkt des Backends (lokal via `npm run dev`, auf dem Server via `npm start`)
import fs from 'fs';
import path from 'path';
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

// Frontend (Single-Page-App) aus demselben Prozess ausliefern, wenn ein Build vorhanden ist (Server).
// Unbekannte Seiten wie /gallery bekommen index.html, damit der React-Router übernimmt.
const indexHtml = path.join(config.paths.frontend, 'index.html');
if (fs.existsSync(indexHtml)) {
    // Dateien mit Hash im Namen (assets/) dürfen lange gecacht werden, index.html nie
    app.use('/assets', express.static(path.join(config.paths.frontend, 'assets'), { maxAge: '1y', immutable: true }));
    app.use(express.static(config.paths.frontend, { index: false }));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith(config.apiPrefix) || req.path.startsWith(config.mediaPrefix)) return next();
        res.set('Cache-Control', 'no-cache');
        res.sendFile(indexHtml);
    });
    console.log(`[web] Frontend aus ${config.paths.frontend}`);
}

await initBackend();

app.listen(config.port, () => {
    console.log(`[api] Server läuft auf http://localhost:${config.port}${config.apiPrefix}`);
});
