import { HeroArea, Image } from '../models/index.js';
import { serializeHeroArea, emptyToNull } from '../utils/serializers.js';

const withImage = { include: [{ model: Image, as: 'image' }] };

/** Es gibt genau einen Hero-Eintrag – wird bei Bedarf mit Standardwerten angelegt. */
async function getOrCreateHeroArea() {
  const heroArea = await HeroArea.findOne(withImage);
  return heroArea ?? HeroArea.create(HeroArea.DEFAULTS);
}

export async function getHeroArea(req, res) {
  const heroArea = await getOrCreateHeroArea();
  res.json({ success: true, data: serializeHeroArea(heroArea) });
}

export async function updateHeroArea(req, res) {
  const { title, text, image_id } = req.body;
  const heroArea = await getOrCreateHeroArea();

  await heroArea.update({ title, text, image_id: emptyToNull(image_id) });
  await heroArea.reload(withImage);

  res.json({ success: true, data: serializeHeroArea(heroArea) });
}
