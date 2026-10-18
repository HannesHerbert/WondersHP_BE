// Zentrale Model-Registrierung: alle Models + Associations an einem Ort
import { sequelize } from '../db/index.js';
import User from './user.model.js';
import Member from './member.model.js';
import Image from './image.model.js';
import Video from './video.model.js';
import Event from './event.model.js';
import HeroArea from './heroArea.model.js';
import BookingTeaser from './bookingTeaser.model.js';
import ContactRequest from './contactRequest.model.js';
import Setting from './setting.model.js';
import Song from './song.model.js';

const imageForeignKey = { name: 'image_id', allowNull: true };

Member.belongsTo(Image, { foreignKey: imageForeignKey, as: 'image' });
Image.hasMany(Member, { foreignKey: imageForeignKey });

HeroArea.belongsTo(Image, { foreignKey: imageForeignKey, as: 'image' });
Image.hasMany(HeroArea, { foreignKey: imageForeignKey });

BookingTeaser.belongsTo(Image, { foreignKey: imageForeignKey, as: 'image' });
Image.hasMany(BookingTeaser, { foreignKey: imageForeignKey });

export { sequelize, User, Member, Image, Video, Event, HeroArea, BookingTeaser, ContactRequest, Setting, Song };
