import { Event } from '../models/index.js';
import HttpError from '../utils/HttpError.js';
import { pick } from '../utils/serializers.js';

async function findEventOrFail(id) {
  if (!id) throw HttpError.badRequest('Event ID erforderlich');
  const event = await Event.findByPk(id);
  if (!event) throw HttpError.notFound('Event nicht gefunden');
  return event;
}

export async function getAllEvents(req, res) {
  const events = await Event.findAll({ order: [['date', 'ASC'], ['time', 'ASC']] });
  res.json({ success: true, data: events });
}

export async function createEvent(req, res) {
  const event = await Event.create(pick(req.body, Event.WRITABLE_FIELDS));
  res.status(201).json(event);
}

export async function updateEvent(req, res) {
  const event = await findEventOrFail(req.body.id);
  await event.update(pick(req.body, Event.WRITABLE_FIELDS));
  res.json({ success: true, message: 'Event erfolgreich aktualisiert', data: event });
}

export async function deleteEvent(req, res) {
  const event = await findEventOrFail(req.body.id);
  await event.destroy();
  res.json({ success: true, message: 'Event erfolgreich gelöscht', deletedCount: 1 });
}
