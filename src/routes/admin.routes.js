import { Router } from 'express';
import { asyncHandler as h } from '../middleware/asyncHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { upload } from '../services/upload.service.js';
import { createUser, validateUser } from '../controllers/user.controller.js';
import { createMember, updateMembers } from '../controllers/member.controller.js';
import { createEvent, updateEvent, deleteEvent } from '../controllers/event.controller.js';
import { updateHeroArea } from '../controllers/heroArea.controller.js';
import { updateBookingTeaser } from '../controllers/bookingTeaser.controller.js';
import { getContactRequests, updateContactRequest, deleteContactRequest } from '../controllers/contact.controller.js';
import { updateSocialLinks } from '../controllers/social.controller.js';
import { getSongs, createSong, updateSong, deleteSong } from '../controllers/song.controller.js';
import { updateHeaderContent, updateMediaContent } from '../controllers/siteContent.controller.js';
import {
    uploadMedia,
    getAllImages,
    getAllVideos,
    getAllAudioFiles,
    getAllDocuments,
    updateImage,
    deleteImage,
} from '../controllers/media.controller.js';

const router = Router();

// Token-Validierung braucht immer ein gültiges Token
router.post('/validate', requireAuth, h(validateUser));

// Alle folgenden Routen: geschützt, sofern ADMIN_AUTH=true
router.use(requireAdmin);

// Benutzer & Mitglieder
router.post('/create-user', h(createUser));
router.post('/create-member', h(createMember));
router.put('/update-members', h(updateMembers));

// Medien
router.post('/upload-media', upload.single('file'), h(uploadMedia));
router.get('/list-images', h(getAllImages));
router.get('/list-videos', h(getAllVideos));
router.get('/list-audio', h(getAllAudioFiles));
router.get('/list-documents', h(getAllDocuments));
router.route('/image/:id')
    .put(h(updateImage))
    .delete(h(deleteImage));

// Termine
router.post('/create-event', h(createEvent));
router.put('/update-event', h(updateEvent));
router.delete('/delete-event', h(deleteEvent));

// Startseite
router.put('/update-hero-area', h(updateHeroArea));
router.put('/update-booking-teaser', h(updateBookingTeaser));

// Repertoire
router.route('/songs')
    .get(h(getSongs))
    .post(h(createSong));
router.route('/songs/:id')
    .put(h(updateSong))
    .delete(h(deleteSong));

// Seiteninhalte (Dashboard → Content)
router.put('/header', h(updateHeaderContent));
router.put('/media-content', h(updateMediaContent));

// Social-Media-Links im Header
router.put('/social-links', h(updateSocialLinks));

// Kontaktanfragen
router.get('/contact-requests', h(getContactRequests));
router.route('/contact-requests/:id')
    .patch(h(updateContactRequest))
    .delete(h(deleteContactRequest));

export default router;
