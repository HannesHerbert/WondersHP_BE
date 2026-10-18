import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

// Repertoire: Titel + Interpret, der Reihe nach (position)
const Song = sequelize.define('Song', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  artist: { type: DataTypes.STRING(200), allowNull: false },
  position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
});

export default Song;
