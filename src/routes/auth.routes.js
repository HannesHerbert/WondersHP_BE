import { Router } from 'express';
import { asyncHandler as h } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { loginUser, validateUser } from '../controllers/user.controller.js';

const router = Router();

router.post('/user', h(loginUser));
router.post('/validation', requireAuth, h(validateUser));

export default router;
