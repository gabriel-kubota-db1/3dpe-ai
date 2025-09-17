import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './model';
import { JWT_SECRET } from '../../config/env';

// Helper to register a user with a specific role
const registerUserByRole = async (req: Request, res: Response, role: 'physiotherapist' | 'industry' | 'patient') => {
  try {
    const { email, name, document } = req.body;

    const existingUser = await User.query().where('email', email).orWhere('document', document).first();
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or document already exists.' });
    }

    // For admin creation, we generate a random password and should send a setup link (not implemented here)
    const randomPassword = Math.random().toString(36).slice(-8);
    const password_hash = await bcrypt.hash(randomPassword, 10);

    const newUser = await User.query().insert({
      ...req.body,
      role,
      password_hash,
    });

    // Omit password_hash from the response
    const { password_hash: _, ...userResponse } = newUser;

    res.status(201).json(userResponse);
  } catch (error: any) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const registerPhysiotherapist = (req: Request, res: Response) => registerUserByRole(req, res, 'physiotherapist');
export const registerIndustry = (req: Request, res: Response) => registerUserByRole(req, res, 'industry');
export const registerPatient = (req: Request, res: Response) => registerUserByRole(req, res, 'patient');


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.query().findOne({ email });

    if (!user || !user.password_hash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'User account is inactive.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    const { password_hash, ...userResponse } = user;

    res.json({ user: userResponse, token });
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const user = await User.query().findById(req.user.id).select('*', User.raw('DATE_FORMAT(date_of_birth, "%Y-%m-%d") as date_of_birth'));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password_hash, ...userResponse } = user;
    res.json(userResponse);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Admin controllers
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.query().select('id', 'name', 'email', 'role', 'active', 'document');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.query().findById(req.params.id).select('*', User.raw('DATE_FORMAT(date_of_birth, "%Y-%m-%d") as date_of_birth'));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password_hash, ...userResponse } = user;
    res.json(userResponse);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.query().patchAndFetchById(id, req.body);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password_hash, ...userResponse } = user;
    res.json(userResponse);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await User.query().deleteById(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const users = await User.query().where('role', role).select('id', 'name');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users by role', error: error.message });
  }
};
