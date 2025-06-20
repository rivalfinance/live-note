import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import logger from './utils/logger';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'lhttp://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'lhttp://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Redis session setup
const SESSION_SECRET = process.env.SESSION_SECRET || 'supersecret';
let redisClient: any;
let redisStore: any;

try {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    legacyMode: true,
  });
  redisClient.connect().catch(console.error);
  redisStore = new RedisStore({ client: redisClient });
  logger.info('Using Redis for session storage');
} catch (err) {
  logger.warn('Redis not available, using in-memory session store');
  redisStore = undefined;
}

app.use(
  session({
    store: redisStore,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notes App API',
      version: '1.0.0',
      description: 'API documentation for the Notes App',
    },
    servers: [
      {
        url: `lhttp://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });

  socket.on('join-note', (noteId: string) => {
    socket.join(noteId);
    logger.info('Client joined note', { socketId: socket.id, noteId });
  });

  socket.on('leave-note', (noteId: string) => {
    socket.leave(noteId);
    logger.info('Client left note', { socketId: socket.id, noteId });
  });

  socket.on('note-update', (data: { noteId: string; content: string }) => {
    socket.to(data.noteId).emit('note-updated', data);
    logger.info('Note updated', { socketId: socket.id, noteId: data.noteId });
  });

  // Real-time editing indicator
  socket.on('editing', (data: { noteId: string; user: { _id: string; name: string } }) => {
    socket.to(data.noteId).emit('user-editing', { user: data.user });
    logger.info('User editing', { socketId: socket.id, noteId: data.noteId, user: data.user });
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app')
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error', { error: error.message });
  });

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
}); 