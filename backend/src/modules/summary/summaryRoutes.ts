import Router from 'express';
import { authenticateJWT } from '../../common/middleware/authenticateJWT';
import * as summaryController from './summaryController';

const router = Router();

router.get('/summary', authenticateJWT, summaryController.summary);

export default router;
