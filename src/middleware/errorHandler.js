import multer from 'multer';
import config from '../config/index.js';

export function notFoundHandler(req, res) {
    res.status(404).json({ success: false, message: `Route nicht gefunden: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
    let status = err.status || 500;
    let message = err.message || 'Interner Serverfehler';

    if (err instanceof multer.MulterError) {
        status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = `Die Datei ist zu groß (höchstens ${Math.round(config.media.maxUploadBytes / 1024 / 1024)} MB).`;
        }
    } else if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        status = 400;
        message = err.errors?.map((e) => e.message).join(', ') || message;
    }

    if (status >= 500) {
        console.error(`[api] ${req.method} ${req.originalUrl}:`, err);
    }

    // `error` bleibt aus Kompatibilitätsgründen zum Frontend erhalten
    res.status(status).json({
        success: false,
        message,
        error: message,
        ...(err.details && { details: err.details }),
        ...(!config.isProduction && status >= 500 && { stack: err.stack }),
    });
}
