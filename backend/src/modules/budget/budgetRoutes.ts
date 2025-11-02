import { Router } from 'express';
import { authenticateJWT } from '../../common/middleware/authenticateJWT';
import * as budgetController from './budgetController';

const router = Router();

router.post('/budget', authenticateJWT, budgetController.createBudget);

export default router;
