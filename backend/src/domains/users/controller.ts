import { Request, Response } from 'express';
import { User } from './model.js';

export const getProfile = async (req: Request, res: Response) => {
  // The user object is attached to the request by the isAuthenticated middleware
  const userId = (req as any).user.id;

  try {
    const user = await User.query().findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving profile', error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { ...updateData } = req.body;

  // Ensure sensitive fields are not updated through this endpoint
  delete updateData.role;
  delete updateData.cpf;
  delete updateData.password_hash;
  delete updateData.active;

  try {
    const user = await User.query().patchAndFetchById(userId, updateData);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};
