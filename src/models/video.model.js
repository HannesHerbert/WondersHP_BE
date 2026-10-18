import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Video = sequelize.define('Video', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sourceUrl: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  usage: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  // In der Galerie zeigen (Dashboard → Medien)
  isPublic: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  // 'local' = Datei in storage/videos, 'youtube' = eingebettet (externalId = YouTube-ID)
  provider: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'local' },
  externalId: { type: DataTypes.STRING(20), allowNull: true },
  // Lokal gespeichertes Vorschaubild (YouTube), damit vor dem Abspielen nichts von YouTube geladen wird
  posterFile: { type: DataTypes.STRING, allowNull: true },
});

/** Einheitliches Format für Frontend (lokal und YouTube) */
Video.serialize = (video) => ({
  id: video.id,
  provider: video.provider || 'local',
  sourceUrl: video.sourceUrl,
  externalId: video.externalId,
  posterUrl: video.posterFile ? `/media/images/${video.posterFile}` : null,
  title: video.title,
  description: video.description,
  isPublic: video.isPublic,
  usage: video.usage,
});

export default Video;
