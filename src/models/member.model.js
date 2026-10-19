import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Member = sequelize.define('Member', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstname: { type: DataTypes.STRING, allowNull: false },
  lastname: { type: DataTypes.STRING, allowNull: false },
  instrument: { type: DataTypes.TEXT, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  image_id: { type: DataTypes.INTEGER, allowNull: true },
  // Position im Grid, im Uhrzeigersinn ab oben (1, 2, 3, …)
  image_position: { type: DataTypes.INTEGER, allowNull: false },
  // Veraltet (früher Special Guests), bleibt nur als Spalte bestehen
  isGuest: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
});

export default Member;
