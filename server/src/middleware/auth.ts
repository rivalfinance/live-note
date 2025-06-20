import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.token;

  if (!token) {
    logger.warn('Authentication failed: No token provided');
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, decoded: any) => {
    if (err) {
      logger.error('Authentication error', { error: err.message });
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    try {
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        logger.warn('Authentication failed: User not found', { userId: decoded.id });
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      req.user = { _id: user._id };
      next();
    } catch (error: any) {
      logger.error('Authentication error', { error: error.message });
      res.status(401).json({ message: 'Not authenticated' });
    }
  });
}; 