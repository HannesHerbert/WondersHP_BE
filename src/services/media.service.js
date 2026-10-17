import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
import config from '../config/index.js';
import HttpError from '../utils/HttpError.js';

const { paths, media } = config;
const execFileAsync = promisify(execFile);

/** Ermittelt den Medientyp anhand der Dateiendung: 'image' | 'video' | null */
export function detectMediaType(filename) {
    const ext = path.extname(filename).toLowerCase();
    if (media.imageExtensions.includes(ext)) return 'image';
    if (media.videoExtensions.includes(ext)) return 'video';
    return null;
}

function buildBaseName(title) {
    const safeTitle = (title || 'upload').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${crypto.randomUUID()}_${safeTitle}`;
}

/** Wandelt ein Bild per ffmpeg in ein temporäres PNG um. */
async function convertWithFfmpeg(inputPath) {
    const outputPath = path.join(paths.tmp, `${crypto.randomUUID()}.png`);
    try {
        await execFileAsync(media.ffmpegPath, ['-v', 'error', '-y', '-i', inputPath, '-frames:v', '1', outputPath]);
    } catch (error) {
        await removeFile(outputPath);
        const reason = error.code === 'ENOENT' ? 'ffmpeg ist nicht installiert' : error.stderr?.trim() || error.message;
        throw HttpError.badRequest(`Bild konnte nicht gelesen werden (${reason})`);
    }
    return outputPath;
}

/**
 * Liefert eine Datei, die sharp lesen kann. Manche AVIF-Varianten kann der sharp-Build nicht
 * dekodieren – dann wird vorher per ffmpeg in PNG umgewandelt.
 * @returns {Promise<{source: string, cleanup: () => Promise<void>}>}
 */
async function readableImage(inputPath) {
    const keep = { source: inputPath, cleanup: async () => {} };
    if (!media.ffmpegFallbackExtensions.includes(path.extname(inputPath).toLowerCase())) return keep;

    try {
        // Komplett dekodieren – metadata() allein erkennt kaputte Bitstreams nicht
        await sharp(inputPath).raw().toBuffer();
        return keep;
    } catch {
        const source = await convertWithFfmpeg(inputPath);
        return { source, cleanup: () => removeFile(source) };
    }
}

/**
 * Konvertiert ein Bild in mehrere WebP-Größen.
 * @returns {Promise<{sourceUrlSM: string, sourceUrlMD: string, sourceUrlLG: string}>} Dateinamen je Größe
 */
export async function processImage(inputPath, title) {
    const baseName = buildBaseName(title);
    const { source, cleanup } = await readableImage(inputPath);

    try {
        const entries = await Promise.all(
            Object.entries(media.imageSizes).map(async ([size, width]) => {
                const filename = `${baseName}_${size}.webp`;
                await sharp(source)
                    .resize({ width, withoutEnlargement: true })
                    // Verkleinern macht weich – leicht nachschärfen
                    .sharpen({ sigma: 0.6 })
                    .webp({ quality: media.imageQuality })
                    .toFile(path.join(paths.images, filename));
                return [`sourceUrl${size.toUpperCase()}`, filename];
            })
        );
        return Object.fromEntries(entries);
    } finally {
        await cleanup();
    }
}

/**
 * Schneidet den Bereich um einen Fokuspunkt aus (Anteil `share` der Bildbreite, gleiches Seitenverhältnis),
 * skaliert ihn hochwertig hoch und schärft nach. Dient als scharfe Ebene beim starken Hineinzoomen.
 * @param {string} sourceFile Dateiname im Bilder-Ordner (größte Variante)
 * @returns {Promise<{filename: string, rect: {x: number, y: number, w: number, h: number}}>} rect in Prozent
 */
export async function createFocusDetail(sourceFile, focusX, focusY, { share = 0.2, scale = 6 } = {}) {
    const input = path.join(paths.images, sourceFile);
    const { width, height } = await sharp(input).metadata();

    const w = Math.round(width * share);
    const h = Math.round(w * (height / width));
    const left = Math.round(Math.min(Math.max((focusX / 100) * width - w / 2, 0), width - w));
    const top = Math.round(Math.min(Math.max((focusY / 100) * height - h / 2, 0), height - h));

    const filename = `${crypto.randomUUID()}_focus_detail.webp`;
    await sharp(input)
        .extract({ left, top, width: w, height: h })
        .resize({ width: w * scale, kernel: sharp.kernel.lanczos3 })
        .sharpen({ sigma: 1.4, m1: 0.8, m2: 2.5 })
        .webp({ quality: 92 })
        .toFile(path.join(paths.images, filename));

    return {
        filename,
        rect: { x: (left / width) * 100, y: (top / height) * 100, w: (w / width) * 100, h: (h / height) * 100 },
    };
}

/** Verschiebt ein Video aus dem tmp-Ordner und liefert die öffentliche URL. */
export async function storeVideo(inputPath, originalName, title) {
    const filename = `${buildBaseName(title)}${path.extname(originalName).toLowerCase()}`;
    await fs.copyFile(inputPath, path.join(paths.videos, filename));
    return `${config.mediaPrefix}/videos/${filename}`;
}

/** Löscht alle Größen eines Bildes; fehlende Dateien werden ignoriert. */
export async function removeImageFiles(image) {
    const filenames = [image.sourceUrlSM, image.sourceUrlMD, image.sourceUrlLG].filter(Boolean);
    await Promise.all(filenames.map((name) => removeFile(path.join(paths.images, name))));
}

/** Entfernt eine Datei, ohne bei Nichtexistenz zu werfen. */
export async function removeFile(filePath) {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') console.error(`[media] Löschen fehlgeschlagen: ${filePath}`, error.message);
    }
}

/** Listet Dateien eines öffentlichen Ordners als { filename, url }. */
export async function listPublicFiles(dir, pattern, urlPrefix) {
    try {
        const files = await fs.readdir(dir);
        return files
            .filter((filename) => pattern.test(filename))
            .map((filename) => ({ filename, url: `${urlPrefix}/${filename}` }));
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}
