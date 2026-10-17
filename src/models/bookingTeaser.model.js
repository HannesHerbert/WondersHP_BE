import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

// Teaser unter den Spielterminen: Überschrift + Bild, beim Scrollen wird in den Zoompunkt hineingezoomt
const BookingTeaser = sequelize.define('BookingTeaser', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: true },
  image_id: { type: DataTypes.INTEGER, allowNull: true },
  // Zoompunkt in Prozent der Bildbreite/-höhe
  focusX: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 50 },
  focusY: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 50 },
  // Hochskalierte, geschärfte Detail-Ebenen um den Zoompunkt (JSON: [{file, x, y, w, h, from, to}], Lage in %)
  detailLayers: { type: DataTypes.TEXT, allowNull: true },
});

BookingTeaser.DEFAULTS = {
  title: 'Interessiert? Buche uns hier!',
  image_id: null,
  focusX: 50,
  focusY: 50,
};

export default BookingTeaser;
