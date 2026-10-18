import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

// Einfache Einstellungen als Schlüssel/Wert (z.B. Social-Media-Links im Header)
const Setting = sequelize.define('Setting', {
  key: { type: DataTypes.STRING(100), primaryKey: true },
  value: { type: DataTypes.TEXT, allowNull: true },
});

export default Setting;
