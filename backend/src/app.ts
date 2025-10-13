import express, { Request, Response } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import { checkBucket } from './common/config/minioClient';
import './common/config/passport';
import { authenticateJWT } from './common/middleware/authenticateJWT';

// Import routes
import authRoutes from './modules/auth/authRoutes';
import userRoutes from './modules/user/userRoutes';
import iconRoutes from './modules/icon/iconRoutes';
import { chatWithAI } from './common/config/openai';

const app = express();

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  checkBucket();
}

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

app.post('/openai', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const response = await chatWithAI(prompt);
    return res.json({ response });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    return res.status(500).json({ error: 'Error communicating with OpenAI' });
  }
});

// Use routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', iconRoutes);

export default app;
