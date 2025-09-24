import Router from 'express';
import { authenticateJWT } from '../../common/middleware/authenticateJWT';
import * as userController from './userController';

const router = Router();

router.get('/me', authenticateJWT, userController.me);

export default router;
