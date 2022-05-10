import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

export interface IJWTDecodedProps {
  matricula: string;
  userId: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization'];
  const tokenSplited = token.split(" ")[1];
  
  if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
  
  jwt.verify(tokenSplited, JWT_SECRET, function(err, decoded) {
    if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
    
    next();
  });
}

export default verifyJWT; 