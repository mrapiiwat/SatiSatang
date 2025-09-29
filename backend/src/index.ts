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

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

//TESTING MINIO CONNECTION
checkBucket();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  }),
);

app.use(express.static(path.join(__dirname, './common/view')));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// Use routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
