import Router from 'express';
import { authenticateJWT } from '../../common/middleware/authenticateJWT';
import * as satiController from './satiController';

const router = Router();

router.post('/sati/check-message', authenticateJWT, satiController.checkMessage);
router.get('/sati/session', authenticateJWT, satiController.getOrCreateLatestSatiSession);

export default router;
