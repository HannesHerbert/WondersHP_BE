import { Router } from 'express';
import { asyncHandler as h } from '../middleware/asyncHandler.js';
import { getAllMembers } from '../controllers/member.controller.js';
import { getAllEvents } from '../controllers/event.controller.js';
import { getHeroArea } from '../controllers/heroArea.controller.js';
import { getBookingTeaser } from '../controllers/bookingTeaser.controller.js';
import { getGalleryImages, getPublicVideos } from '../controllers/media.controller.js';
import { getContactToken, createContactRequest } from '../controllers/contact.controller.js';
import { getSocialLinks } from '../controllers/social.controller.js';

const router = Router();

router.get('/members', h(getAllMembers));
router.get('/events', h(getAllEvents));
router.get('/hero-area', h(getHeroArea));
router.get('/booking-teaser', h(getBookingTeaser));
router.get('/gallery', h(getGalleryImages));
router.get('/videos', h(getPublicVideos));
router.get('/social-links', h(getSocialLinks));

// Kontaktformular: Token holen (Zeitfalle), dann absenden
router.get('/contact/token', h(getContactToken));
router.post('/contact', h(createContactRequest));

export default router;
