import { Router } from 'express';
import * as goalController from './goalController';
import { authenticateJWT } from '../../common/middleware/authenticateJWT';

const router = Router();

router.get('/goal', authenticateJWT, goalController.getGoals);
router.post('/goal', authenticateJWT, goalController.createGoal);
router.put('/goal/:id', authenticateJWT, goalController.updateGoal);
router.delete('/goal/:id', authenticateJWT, goalController.deleteGoal);

export default router;
