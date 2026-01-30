import { DataTypes } from 'sequelize';
import { sequelize } from '../service/db.service.js';

const Date = sequelize.define('Date', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  street: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  number: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    unique: false,
  }
});

export default Date