import { Request, Response, NextFunction } from 'express';

export const isIndustry = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if (req.user && req.user.role === 'industry') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Industry users only' });
  }
};
