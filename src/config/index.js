import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Pfade relativ zum Backend-Ordner auflösen – unabhängig vom Arbeitsverzeichnis beim Start
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Umgebungsvariablen genau einmal laden: .env.<NODE_ENV>, optional ergänzt durch eine lokale .env
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.join(rootDir, `.env.${nodeEnv}`), quiet: true });
dotenv.config({ path: path.join(rootDir, '.env'), quiet: true });

const env = process.env;

function parseDbHost(rawHost = 'localhost', fallbackPort = 3306) {
    const [host, port] = rawHost.split(':');
    return { host, port: Number(port || fallbackPort) };
}

const { host: dbHost, port: dbPort } = parseDbHost(env.MYSQL_HOST, env.MYSQL_PORT);
const storageDir = path.resolve(rootDir, env.STORAGE_DIR || 'storage');

const config = Object.freeze({
    nodeEnv,
    isProduction: nodeEnv === 'production',

    port: Number(env.PORT || 3001),
    apiPrefix: env.API_PREFIX ?? '/api',
    mediaPrefix: env.MEDIA_PREFIX ?? '/media',
    corsOrigin: env.ORIGIN_FE || '*',
    jsonLimit: '100mb',

    db: {
        name: env.MYSQL_DATABASE || env.DB_NAME || 'test',
        user: env.MYSQL_USER || env.DB_USER || 'root',
        password: env.MYSQL_PASSWORD || env.DB_PASS || '',
        host: dbHost,
        port: dbPort,
        ssl: dbHost.includes('aivencloud.com') || env.MYSQL_SSL === 'true',
        logging: env.DB_LOGGING === 'true',
        pool: {
            max: Number(env.DB_POOL_MAX || 10),
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },

    auth: {
        jwtSecret: env.JWT_SECRET,
        tokenTtl: env.JWT_TTL || '1h',
        // Admin-Routen sind nur geschützt, wenn ADMIN_AUTH=true gesetzt ist
        adminProtected: env.ADMIN_AUTH === 'true',
    },

    hcaptchaSecret: env.HCAPTCHA_SECRET,

    paths: {
        storage: storageDir,
        images: path.join(storageDir, 'images'),
        videos: path.join(storageDir, 'videos'),
        tmp: path.join(storageDir, 'tmp'),
        audio: path.join(storageDir, 'audio'),
        documents: path.join(storageDir, 'documents'),
    },

    media: {
        maxUploadBytes: 100 * 1024 * 1024,
        imageSizes: { sm: 300, md: 800, lg: 1920 },
        imageQuality: 85,
        imageExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'],
        // Formate, die sharp je nach Build nicht immer dekodiert – dann übernimmt ffmpeg
        ffmpegFallbackExtensions: ['.avif'],
        ffmpegPath: env.FFMPEG_PATH || 'ffmpeg',
        videoExtensions: ['.mp4', '.avi', '.mov', '.mkv'],
        audioPattern: /\.(mp3|wav|ogg|flac|aac)$/i,
        documentPattern: /\.(pdf|doc|docx|txt|xlsx|xls)$/i,
    },
});

export default config;
