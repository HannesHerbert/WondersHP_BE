import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import config from '../config/index.js';

// Uploads landen zunächst im tmp-Ordner und werden danach von media.service verarbeitet
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.paths.tmp),
    filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});

export const upload = multer({
    storage,
    limits: { fileSize: config.media.maxUploadBytes },
});
