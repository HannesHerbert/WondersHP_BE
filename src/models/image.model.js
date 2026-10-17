import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Image = sequelize.define('Image', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sourceUrlSM: { type: DataTypes.STRING, allowNull: false },
  sourceUrlMD: { type: DataTypes.STRING, allowNull: false },
  sourceUrlLG: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  isPublic: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
});

export default Image;
