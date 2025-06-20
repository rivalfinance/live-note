import express, { Request, Response, NextFunction } from 'express';
import { register, login, getMe, logout } from '../controllers/auth';
import { authenticate } from '../middleware/auth';
import logger from '../utils/logger';
import Joi from 'joi';

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
router.post('/register', (req: Request, res: Response, next: NextFunction) => {
  logger.info('Register attempt', { email: req.body.email });
  const { error } = registerSchema.validate(req.body);
  if (error) {
    logger.warn('Register validation failed', { error: error.message });
    return res.status(400).json({ message: error.message });
  }
  register(req, res).catch((error: any) => {
    logger.error('Register failed', { error: error.message, email: req.body.email });
    next(error);
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  logger.info('Login attempt', { email: req.body.email });
  const { error } = loginSchema.validate(req.body);
  if (error) {
    logger.warn('Login validation failed', { error: error.message });
    return res.status(400).json({ message: error.message });
  }
  login(req, res).catch((error: any) => {
    logger.error('Login failed', { error: error.message, email: req.body.email });
    next(error);
  });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticate, (req: AuthRequest, res: Response, next: NextFunction) => {
  logger.info('Get current user attempt');
  getMe(req, res).catch((error: any) => {
    logger.error('Get current user failed', { error: error.message });
    next(error);
  });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  logger.info('Logout attempt');
  logout(req, res).catch((error: any) => {
    logger.error('Logout failed', { error: error.message });
    next(error);
  });
});

export default router; 