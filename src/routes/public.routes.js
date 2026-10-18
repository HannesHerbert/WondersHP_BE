import { Router } from 'express';
import { asyncHandler as h } from '../middleware/asyncHandler.js';
import { getAllMembers } from '../controllers/member.controller.js';
import { getAllEvents } from '../controllers/event.controller.js';
import { getHeroArea } from '../controllers/heroArea.controller.js';
import { getBookingTeaser } from '../controllers/bookingTeaser.controller.js';
import { getGalleryImages, getPublicVideos } from '../controllers/media.controller.js';
import { getContactToken, createContactRequest } from '../controllers/contact.controller.js';
import { getSocialLinks } from '../controllers/social.controller.js';
import { getPublicRepertoire } from '../controllers/song.controller.js';
import { getHeaderContent, getMediaContent } from '../controllers/siteContent.controller.js';

const router = Router();

router.get('/members', h(getAllMembers));
router.get('/events', h(getAllEvents));
router.get('/hero-area', h(getHeroArea));
router.get('/booking-teaser', h(getBookingTeaser));
router.get('/gallery', h(getGalleryImages));
router.get('/videos', h(getPublicVideos));
router.get('/social-links', h(getSocialLinks));
router.get('/repertoire', h(getPublicRepertoire));
router.get('/header', h(getHeaderContent));
router.get('/media-content', h(getMediaContent));

// Kontaktformular: Token holen (Zeitfalle), dann absenden
router.get('/contact/token', h(getContactToken));
router.post('/contact', h(createContactRequest));

export default router;
