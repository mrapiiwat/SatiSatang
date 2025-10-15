import { Router } from 'express';
import { authenticateJWT } from '../../common/middleware/authenticateJWT';
import * as categoriesController from './categoriesController';

const router = Router();

router.get('/categories', authenticateJWT, categoriesController.getCategories);
router.get('/category/:id', authenticateJWT, categoriesController.getCategory);
router.post('/category', authenticateJWT, categoriesController.createCategory);
router.put('/category/:id', authenticateJWT, categoriesController.updateCategory);
router.delete('/category/:id', authenticateJWT, categoriesController.deleteCategory);

export default router;
