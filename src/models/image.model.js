import { DataTypes } from 'sequelize';
import { sequelize } from '../service/db.service.js';

const Image = sequelize.define('Media', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sourceUrlSM: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  sourceUrlMD: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  sourceUrlLG: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  title: {
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

export default Image