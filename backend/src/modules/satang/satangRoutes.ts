import Router from 'express';
import { authenticateJWT } from '../../common/middleware/authenticateJWT';
import * as satangController from './satangController';

const router = Router();

router.post('/satang/session', authenticateJWT, satangController.createSatangSession);
router.get('/satang/session', authenticateJWT, satangController.getLatestSatangSession);
router.post('/satang', authenticateJWT, satangController.SatangChat);

export default router;
