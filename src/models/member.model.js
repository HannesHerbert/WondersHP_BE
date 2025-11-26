import { DataTypes } from 'sequelize';
import { sequelize } from '../service/db.service.js';

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  instrument: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: false,
  },
  image_path: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  image_position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  }
});

export default Member