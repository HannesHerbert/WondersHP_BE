import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const HeroArea = sequelize.define('HeroArea', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: true },
  text: { type: DataTypes.TEXT, allowNull: true },
  image_id: { type: DataTypes.INTEGER, allowNull: true },
});

HeroArea.DEFAULTS = {
  title: 'The Wonders',
  text: 'Deine Live-Band für unvergessliche Momente',
  image_id: null,
};

export default HeroArea;
