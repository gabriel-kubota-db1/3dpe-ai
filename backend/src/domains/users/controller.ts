import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from './model';
import { generateToken } from '../../utils/jwt';

// For Auth
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.query().findOne({ email });

    if (user && (await user.verifyPassword(password))) {
      const token = generateToken({ id: user.id, role: user.role });
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // The user object is attached to the request by the isAuthenticated middleware
    const user = await User.query().findById((req as any).user.id).select('id', 'name', 'email', 'role', 'cpf', 'crefito', 'cnpj', 'phone', 'address');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};


// For Admin User Registration
const registerUser = async (req: Request, res: Response, role: 'physiotherapist' | 'industry') => {
  try {
    const { password, ...userData } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required for new users.' });
    }

    const user = await User.query().insert({
      ...userData,
      role,
      password_hash: password, // Pass plain password to be hashed by the model's hook
    });

    // Omit password from the response
    const { password_hash, ...newUser } = user;

    console.log(`
      ===============================================
      USER CREATED
      Email: ${user.email}
      Password was set during creation.
      ===============================================
    `);

    res.status(201).json(newUser);
  } catch (error: any) {
    if (error.nativeError && error.nativeError.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'User with this email or identifier already exists.' });
    }
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

export const registerPhysiotherapist = (req: Request, res: Response) => {
  registerUser(req, res, 'physiotherapist');
};

export const registerIndustry = (req: Request, res: Response) => {
  registerUser(req, res, 'industry');
};


// For Admin User Management
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.query().select('id', 'name', 'email', 'role', 'active').where('role', '!=', 'admin');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.query().findById(req.params.id).select('id', 'name', 'email', 'role', 'active', 'cpf', 'crefito', 'cnpj', 'phone', 'address');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { password, ...updateData } = req.body;

    if (password && password.trim() !== '') {
      // Pass the plain password to be hashed by the model's hook
      (updateData as any).password_hash = password;
    }
    
    const user = await User.query().patchAndFetchById(req.params.id, updateData);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

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
