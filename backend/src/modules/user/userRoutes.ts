import { Router } from 'express';
import { authenticateJWT } from '../../common/middleware/authenticateJWT';
import * as userController from './userController';

const router = Router();

router.get('/me', authenticateJWT, userController.me);
router.put('/change-password', authenticateJWT, userController.changePassword);
router.put('/update-name', authenticateJWT, userController.updateName);

export default router;
