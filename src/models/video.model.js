import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Video = sequelize.define('Video', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sourceUrl: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  usage: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
});

export default Video;
