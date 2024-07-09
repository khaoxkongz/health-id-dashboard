import 'dotenv/config';

import mongoose from 'mongoose';

import express, { Express } from 'express';
import cors from 'cors';
import { Server } from 'http';

import multerDiskRouter from './api/routes/multer-disk';
import multerMemmoryRouter from './api/routes/multer-memmory';
import healthIdDashboardRouter from './api/routes/health-id-dashboard';

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createServer = (): Express => {
  const server = express();

  server.use(cors());
  server.use(express.json({ limit: 1024 * 1024 * 5 }));
  server.use(express.urlencoded({ extended: true, limit: 1024 * 1024 * 5 }));

  server.use('/api/v1/multer/disk', multerDiskRouter);
  server.use('/api/v1/multer/memmory', multerMemmoryRouter);

  server.use('/api/v1/', healthIdDashboardRouter);

  return server;
};

const shutdown = async (signal: string, httpServer: Server): Promise<void> => {
  console.log(`\n${signal} received. Starting graceful shutdown`);
  httpServer.close(() => mongoose.connection.close());
  console.log('HTTP server closed');
};

const startServer = async (): Promise<void> => {
  try {
    await connectToDatabase();

    const server = createServer();
    const httpServer = server.listen(PORT, () => console.log(`Server is listening on http://127.0.0.1:${PORT}`));

    process.on('SIGINT', () => shutdown('SIGINT', httpServer));
    process.on('SIGTERM', () => shutdown('SIGTERM', httpServer));
  } catch (error) {
    console.error('Error during starting server:', error);
  }
};

startServer();
