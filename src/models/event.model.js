import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.STRING, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  venue: { type: DataTypes.STRING, allowNull: false },
  link: { type: DataTypes.STRING, allowNull: true },
  street: { type: DataTypes.STRING, allowNull: true },
  number: { type: DataTypes.STRING, allowNull: true },
  postalCode: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  isPublic: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
});

// Felder, die über die API geschrieben werden dürfen
Event.WRITABLE_FIELDS = ['date', 'time', 'venue', 'link', 'street', 'number', 'postalCode', 'city', 'isPublic'];

export default Event;
