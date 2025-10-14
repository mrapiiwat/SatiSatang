import { Router } from 'express';
import { authenticateJWT } from '../../common/middleware/authenticateJWT';
import * as transactionController from './transactionController';
import { upload } from '../../common/middleware/upload';

const router = Router();

router.get('/transaction', authenticateJWT, transactionController.getTransactions);
router.get('/transaction/:id', authenticateJWT, transactionController.getTransaction);
router.get('/transaction/receipt/:id', authenticateJWT, transactionController.getReceipt);
router.post(
  '/transaction',
  authenticateJWT,
  upload.single('receipt'),
  transactionController.createTransaction,
);
router.put(
  '/transaction/:id',
  authenticateJWT,
  upload.single('receipt'),
  transactionController.updateTransaction,
);

export default router;
