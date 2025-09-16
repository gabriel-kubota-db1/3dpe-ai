import { Request, Response, NextFunction } from 'express';

export const isPhysiotherapist = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if (req.user && req.user.role === 'physiotherapist') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Physiotherapists only' });
  }
};
