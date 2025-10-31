import express, { Request, Response } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import { checkBucket } from './common/config/minioClient';
import './common/config/passport';

// Import routes
import authRoutes from './modules/auth/authRoutes';
import userRoutes from './modules/user/userRoutes';
import iconRoutes from './modules/icon/iconRoutes';
import transactionRoutes from './modules/transaction/transactionRoutes';
import categoriesRoutes from './modules/categories/categoriesRoutes';
import satangRouter from './modules/satang/satangRoutes';
import goalRouter from './modules/goal/goalRoutes';
import summaryRouter from './modules/summary/summaryRoutes';

const app = express();

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  checkBucket();
}

app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }),
);

app.use(express.static(path.join(__dirname, './common/view')));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!!!');
});

// Use routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', iconRoutes);
app.use('/api', transactionRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', satangRouter);
app.use('/api', goalRouter);
app.use('/api', summaryRouter);

export default app;
