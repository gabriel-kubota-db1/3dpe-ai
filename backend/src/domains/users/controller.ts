import { Request, Response } from 'express';
import { User } from './model';
import { Physiotherapist } from '../physiotherapists/model';
import { Industry } from '../industries/model';
import jwt from 'jsonwebtoken';
import { Model } from 'objection';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Admin: Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.query().withGraphFetched('[physiotherapist, industry]');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Admin: Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.query().findById(req.params.id).withGraphFetched('[physiotherapist, industry]');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Admin: Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      council_acronym,
      council_number,
      council_uf,
      loyalty_discount,
      ...userData
    } = req.body;

    const user = await User.transaction(async (trx) => {
      const updatedUser = await User.query(trx).patchAndFetchById(id, userData);

      if (!updatedUser) {
        throw new Error('User not found');
      }

      if (updatedUser.role === 'physiotherapist') {
        const physioData = { council_acronym, council_number, council_uf, loyalty_discount };
        await Physiotherapist.query(trx)
          .patch(physioData)
          .where('user_id', id);
      }
      
      return updatedUser;
    });

    const fullUser = await User.query().findById(id).withGraphFetched('[physiotherapist, industry]');
    res.json(fullUser);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Admin: Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const numDeleted = await User.query().deleteById(req.params.id);
    if (numDeleted > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};


// Admin: Register Physiotherapist
export const registerPhysiotherapist = async (req: Request, res: Response) => {
  const {
    council_acronym,
    council_number,
    council_uf,
    loyalty_discount,
    ...userData
  } = req.body;

  try {
    const existingUser = await User.query().findOne({ email: userData.email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Temporary password, user will be prompted to change it.
    const temporaryPassword = crypto.randomBytes(8).toString('hex');

    const user = await Model.transaction(async (trx) => {
      const newUser = await User.query(trx).insert({
        ...userData,
        role: 'physiotherapist',
        password_hash: temporaryPassword,
      });

      await Physiotherapist.query(trx).insert({
        user_id: newUser.id,
        council_acronym,
        council_number,
        council_uf,
        loyalty_discount,
      });

      return newUser;
    });

    // TODO: Implement email service to send a password setup link.
    // For now, we just return success.
    console.log(`---> Password setup email for ${user.email} with temp pass: ${temporaryPassword}`);

    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error registering physiotherapist', error: error.message });
  }
};

// Admin: Register Industry
export const registerIndustry = async (req: Request, res: Response) => {
    const userData = req.body;
  try {
    const existingUser = await User.query().findOne({ email: userData.email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const temporaryPassword = crypto.randomBytes(8).toString('hex');

    const user = await Model.transaction(async (trx) => {
        const newUser = await User.query(trx).insert({
            ...userData,
            role: 'industry',
            password_hash: temporaryPassword,
        });

        await Industry.query(trx).insert({
            user_id: newUser.id,
        });

        return newUser;
    });

    // TODO: Implement email service to send a password setup link.
    console.log(`---> Password setup email for ${user.email} with temp pass: ${temporaryPassword}`);

    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error registering industry', error: error.message });
  }
};


// Auth: Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.query().findOne({ email });
    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Auth: Get Profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const user = await User.query().findById(userId).withGraphFetched('[physiotherapist, industry]');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};
