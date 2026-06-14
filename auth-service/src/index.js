import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import Redis from 'ioredis';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
app.set('redis', redis);

app.use('/api/auth', authRouter);

const port = process.env.PORT || 4001;
app.listen(port, () => console.log(`Auth service listening on ${port}`));
