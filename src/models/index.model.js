// src/models/index.js
import Member from './member.model.js';
import Image from './image.model.js';
import { sequelize } from '../service/db.service.js';

// 🔥 Associations ZENTRAL definieren (keine Imports in Models!)
Member.belongsTo(Image, { 
  foreignKey: 'image_id', 
  as: 'image' 
});

Image.hasMany(Member, { 
  foreignKey: 'image_id' 
});

// Export
export { Member, Image, sequelize };
export default { Member, Image, sequelize };
