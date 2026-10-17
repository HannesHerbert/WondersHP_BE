import { Router } from 'express';
import { asyncHandler as h } from '../middleware/asyncHandler.js';
import { verifyHCaptcha } from '../controllers/hcaptcha.controller.js';

const router = Router();

router.post('/verify', h(verifyHCaptcha));

export default router;
