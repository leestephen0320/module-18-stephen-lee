import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    const secretKey = process.env.JWT_SECRET_KEY || '';

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err || !decoded) {
        return res.sendStatus(403); // Forbidden
      }
  
      const { _id, username, email } = decoded as JwtPayload;
      // Store user information in locals or attach it as a parameter to be accessed in handlers
      res.locals.user = { _id, username, email };
      return next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

export const signToken = (username: string, email: string, userId: string) => {
  const payload = { username, email, userId }; // Use userId instead of _id
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};