import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.token;

  if (!token) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
