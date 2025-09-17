import { Request, Response, NextFunction } from 'express';

export const isAdminOrPhysiotherapist = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const userRole = req.user?.role;
  if (userRole && (userRole === 'admin' || userRole === 'physiotherapist')) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin or Physiotherapist access required' });
  }
};
