import { Router } from 'express';
import { asyncHandler as h } from '../middleware/asyncHandler.js';
import { getAllMembers } from '../controllers/member.controller.js';
import { getAllEvents } from '../controllers/event.controller.js';
import { getHeroArea } from '../controllers/heroArea.controller.js';
import { getBookingTeaser } from '../controllers/bookingTeaser.controller.js';

const router = Router();

router.get('/members', h(getAllMembers));
router.get('/events', h(getAllEvents));
router.get('/hero-area', h(getHeroArea));
router.get('/booking-teaser', h(getBookingTeaser));

export default router;
