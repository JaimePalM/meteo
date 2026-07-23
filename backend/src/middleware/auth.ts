import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  console.log(`[AUTH] ${req.method} ${req.path} - Token present:`, !!token);

  if (!token) {
    console.warn(`[AUTH] No token provided for ${req.method} ${req.path}`);
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meteo_jwt_secret_key_dev_only_change_in_production') as {
      id: number;
      username: string;
    };
    req.user = decoded;
    console.log(`[AUTH] Token valid for user:`, decoded.username);
    next();
  } catch (error) {
    console.error(`[AUTH] Token verification failed:`, error instanceof Error ? error.message : 'Unknown error');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default authMiddleware;
