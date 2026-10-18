import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

// Anfragen aus dem Kontaktformular – verwaltet im Dashboard
const ContactRequest = sequelize.define('ContactRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(254), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  // new = ungelesen, read = gelesen, answered = beantwortet
  status: { type: DataTypes.ENUM('new', 'read', 'answered'), allowNull: false, defaultValue: 'new' },
  answeredAt: { type: DataTypes.DATE, allowNull: true },
});

ContactRequest.STATUSES = ['new', 'read', 'answered'];

export default ContactRequest;
