import { Router } from 'express';
import { authenticateJWT } from '../../common/middleware/authenticateJWT';
import * as iconController from './iconController';
import { upload } from '../../common/middleware/upload';

const router = Router();

router.get('/icon', authenticateJWT, iconController.getIcons);
router.get('/icon/:id', authenticateJWT, iconController.getIcon);
router.post('/icon', authenticateJWT, upload.single('url'), iconController.createIcon);
router.put('/icon/:id', authenticateJWT, upload.single('url'), iconController.updateIcon);

export default router;
