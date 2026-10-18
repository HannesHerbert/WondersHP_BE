import { Router } from 'express';
import { sequelize } from '../models/index.js';
import AdminRouter from './admin.routes.js';
import AuthRouter from './auth.routes.js';
import PublicRouter from './public.routes.js';

const router = Router();

router.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', message: error.message });
    }
});

router.use('/admin', AdminRouter);
router.use('/login', AuthRouter);
router.use('/public', PublicRouter);

export default router;
