import { DataTypes } from 'sequelize';
import { sequelize } from '../service/db.service.js';

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sourceUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  usage: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue:  null,
    unique: false,
  }
});

export default Video