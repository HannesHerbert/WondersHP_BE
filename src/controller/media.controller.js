import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import Image from '../models/image.model.js';
import Video from '../models/video.model.js'; // ← NEU: Video-Model importieren
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = '/app/public/media';

const imageDir = path.join(uploadDir, 'images');
const videoDir = path.join(uploadDir, 'videos');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

export async function uploadMedia(req, res) {
    try {

        const file = req.file;
        const body = req.body;
        console.log('body:', body);

        if (!file) return res.status(400).json({ error: 'Keine Datei hochgeladen' });

        const originalExt = path.extname(file.originalname).toLowerCase();
        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(originalExt);
        const isVideo = ['.mp4', '.avi', '.mov', '.mkv'].includes(originalExt);

        console.log('Verarbeite Datei:', file.originalname, 'Typ:', originalExt);

        if (!isImage && !isVideo) {
            return res.status(400).json({ error: 'Nicht unterstütztes Dateiformat' });
        }

        const uniqueId = uuidv4();
        const uploadPaths = {};
        const sizes = { sm: '300x', md: '800x', lg: '1920x' };

        // ✅ BILDER: WebP in images/ + Image-DB-Eintrag
        if (isImage) {

            for (const [suffix, size] of Object.entries(sizes)) {
                const filename = `${uniqueId}_${body.title}_${suffix}.webp`;
                const outputPath = path.join(imageDir, filename);
                const inputPath = file.path;

                console.log(`Konvertiere Bild ${inputPath} → ${outputPath}`);
                const cmd = `convert "${inputPath}" -resize "${size}" -quality 85 "${outputPath}"`;
                await execAsync(cmd);

                console.log('✅ Bild erstellt:', fs.existsSync(outputPath));
                uploadPaths[`sourceUrl${suffix.toUpperCase()}`] = `/media/images/${filename}`;
            }

            // temporäre Upload-Datei löschen
            fs.unlinkSync(file.path);

            const newImage = await Image.create({
                sourceUrlSM: uploadPaths.sourceUrlSM,
                sourceUrlMD: uploadPaths.sourceUrlMD,
                sourceUrlLG: uploadPaths.sourceUrlLG,
                title: body.title,
                description: body.description,
                usage: null
            });

            console.log('Ordner-Inhalt:', {
                images: fs.readdirSync(imageDir).slice(0, 5),
                videos: fs.readdirSync(videoDir)
            });

            return res.json({
                success: true,
                type: 'image',
                imageId: newImage.id,
                files: Object.values(uploadPaths)
            });
        }

        // ✅ VIDEOS: unverändert in videos/ + Video-DB-Eintrag
        if (isVideo) {
            const videoFilename = `${uniqueId}_${body.title}`;
            const videoOutputPath = path.join(videoDir, videoFilename);

            console.log(`Kopiere Video ${file.path} → ${videoOutputPath}`);

            await new Promise((resolve, reject) => {
                const readStream = fs.createReadStream(file.path);
                const writeStream = fs.createWriteStream(videoOutputPath);

                readStream.on('error', reject);
                writeStream.on('error', reject);
                writeStream.on('close', resolve);

                readStream.pipe(writeStream);
            });

            // Temp-Datei nach erfolgreichem Kopieren löschen
            fs.unlinkSync(file.path);

            const publicVideoUrl = `/media/videos/${videoFilename}`;

            const newVideo = await Video.create({
                sourceUrl: publicVideoUrl,
                title: body.title,
                description: body.description,
                usage: null
            });

            console.log('Ordner-Inhalt:', {
                images: fs.readdirSync(imageDir).slice(0, 5),
                videos: fs.readdirSync(videoDir)
            });

            return res.json({
                success: true,
                type: 'video',
                videoId: newVideo.id,
                file: publicVideoUrl
            });
        }
    } catch (error) {
        console.error('Konvertierungsfehler:', error);
        // Aufräumen, falls temporäre Datei noch existiert
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }
        }
        res.status(500).json({ error: 'Konvertierung fehlgeschlagen', details: error.message });
    }
}

// deine getAllImages-Funktion kann bleiben wie sie ist
export async function getAllImages(req, res) {
    console.log(req.body);

    try {
        const allImages = await Image.findAll();
        res.status(201).json({
            success: true,
            data: allImages,
        });
    } catch (error) {
        console.error('Failed to get all images', error);
        res.status(500).json({ message: 'Failed to get all images', error: error.message });
    }
}
