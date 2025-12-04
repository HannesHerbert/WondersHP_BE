import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import Image from '../models/image.model.js';
import { fileURLToPath } from 'url';
import { legacyNormalizeExpression } from '@cloudinary/url-gen/backwards/utils/legacyNormalizeExpression';


const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = '/app/public/media';

const imageDir = path.join(uploadDir, 'images');
const videoDir = path.join(uploadDir, 'videos');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

export async function convertMedia(req, res) {
    try {
        const file = req.file;
        console.log('file nach Deklaration:', file);

        if (!file) return res.status(400).json({ error: 'Keine Datei hochgeladen' });

        const nameWithoutExt = path.parse(file.originalname).name;
        const originalExt = path.extname(file.originalname).toLowerCase();
        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(originalExt);
        const isVideo = ['.mp4', '.avi', '.mov', '.mkv'].includes(originalExt);

        console.log('Verarbeite Datei:', file.originalname, 'Typ:', originalExt);

        if (!isImage && !isVideo) {
            return res.status(400).json({ error: 'Nicht unterstütztes Dateiformat' });
        }

        const uniqueId = uuidv4();
        const uploadPaths = {};
        const sizes = { sm: '300x300>', md: '800x800>', lg: '1920x1920>' };

        // ✅ BILDER: WebP in images/
        if (isImage) {
            for (const [suffix, size] of Object.entries(sizes)) {
                const filename = `${uniqueId}_${nameWithoutExt}_${suffix}.webp`;
                const outputPath = path.join(imageDir, filename);
                const inputPath = file.path;

                console.log(`Konvertiere Bild ${inputPath} → ${outputPath}`);
                const cmd = `convert "${inputPath}" -resize "${size}" -quality 85 "${outputPath}"`;
                await execAsync(cmd);

                console.log('✅ Bild erstellt:', fs.existsSync(outputPath));
                uploadPaths[`sourceUrl${suffix.toUpperCase()}`] = `/media/images/${filename}`;
            }
        }
        // ✅ VIDEOS: Thumbnails (WebP) in images/
        else if (isVideo) {
            for (const [suffix, size] of Object.entries(sizes)) {
                const filename = `${uniqueId}_${nameWithoutExt}_${suffix}.webp`;
                const outputPath = path.join(imageDir, filename);  // ← Auch Thumbnails in images/

                console.log(`Konvertiere Video-Thumbnail ${file.path}[0] → ${outputPath}`);
                const cmd = `convert "${file.path}[0]" -resize "${size}" -quality 85 "${outputPath}"`;
                await execAsync(cmd);

                console.log('✅ Video-Thumbnail erstellt:', fs.existsSync(outputPath));
                uploadPaths[`sourceUrl${suffix.toUpperCase()}`] = `/media/images/${filename}`;
            }
        }

        console.log('Ordner-Inhalt:', {
            images: fs.readdirSync(imageDir).slice(0, 5),
            videos: fs.readdirSync(videoDir)
        });

        const newMedia = await Image.create({
            sourceUrlSM: uploadPaths.sourceUrlSM,
            sourceUrlMD: uploadPaths.sourceUrlMD,
            sourceUrlLG: uploadPaths.sourceUrlLG,
            title: nameWithoutExt,
            usage: null
        });

        fs.unlinkSync(file.path);
        res.json({ success: true, mediaId: newMedia.id, files: Object.values(uploadPaths) });

    } catch (error) {
        console.error('Konvertierungsfehler:', error);
        res.status(500).json({ error: 'Konvertierung fehlgeschlagen', details: error.message });
    }
}


export async function getAllImages(req, res) {

    console.log(req.body);

    try {
        const allImages = await Image.findAll();
        res.status(201).json({
            success: true,
            data: allImages,
        });

    } catch (error) {
        console.error('Failed to get all images', error); // Protokollieren der genauen Fehlermeldung
        res.status(500).json({ message: 'Failed to get all images', error: error.message });
    }

}