import { Router } from 'express';
import { authenticateJWT } from '../../common/middleware/authenticateJWT';
import * as stockController from './stockController';

const router = Router();

router.get('/stock', authenticateJWT, stockController.getStocks);
router.get('/stock/:id', authenticateJWT, stockController.getStock);

export default router;
