import { Op } from 'sequelize';
import { Member, Image, sequelize } from '../models/index.js';
import HttpError from '../utils/HttpError.js';
import { serializeMember, emptyToNull } from '../utils/serializers.js';

const withImage = { include: [{ model: Image, as: 'image' }] };

/** Formulardaten → Model-Felder mit sinnvollen Defaults */
function normalizeMember(data = {}) {
  return {
    firstname: data.firstname || '',
    lastname: data.lastname || '',
    instrument: data.instrument || '',
    description: data.description || '',
    image_position: Number(data.image_position) || 1,
    image_id: emptyToNull(data.image_id),
    isGuest: data.isGuest === true || data.isGuest === 'true',
  };
}

/** Neue Members aus dem Frontend tragen eine temporäre ID ("temp_…") */
const isPersistedId = (id) => id && !String(id).startsWith('temp_');

export async function getAllMembers(req, res) {
  const members = await Member.findAll({ ...withImage, order: [['isGuest', 'ASC'], ['image_position', 'ASC']] });
  res.json({ success: true, data: members.map(serializeMember) });
}

export async function createMember(req, res) {
  const member = await Member.create(normalizeMember(req.body));
  res.status(201).json(member);
}

/** Speichert die komplette Member-Liste atomar (Update bestehender, Anlage neuer Einträge). */
export async function updateMembers(req, res) {
  if (!Array.isArray(req.body)) {
    throw HttpError.badRequest('Erwartet wird ein Array von Mitgliedern');
  }

  const savedIds = await sequelize.transaction(async (transaction) => {
    const ids = [];

    for (const memberData of req.body) {
      const fields = normalizeMember(memberData);

      if (isPersistedId(memberData.id)) {
        const [updatedCount] = await Member.update(fields, { where: { id: memberData.id }, transaction });
        if (updatedCount > 0) ids.push(memberData.id);
      } else {
        const created = await Member.create(fields, { transaction });
        ids.push(created.id);
      }
    }

    return ids;
  });

  const members = await Member.findAll({ where: { id: { [Op.in]: savedIds } }, ...withImage });
  res.json({ success: true, data: members.map(serializeMember) });
}
