import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from './model';
import { generateToken } from '../../utils/jwt';

// For Auth
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.query().findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
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
const registerUser = async (userData: Partial<User>, res: Response) => {
  try {
    // In a real app, you'd send an email with a password setup link
    // For this implementation, we'll set a temporary password
    const temporaryPassword = 'Password123!'; // Should be randomly generated
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const user = await User.query().insert({
      ...userData,
      password: hashedPassword,
    });

    // Omit password from the response
    const { password, ...newUser } = user;

    console.log(`
      ===============================================
      USER CREATED
      Email: ${user.email}
      Temporary Password: ${temporaryPassword}
      Please change this password upon first login.
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
  registerUser({ ...req.body, role: 'physiotherapist' }, res);
};

export const registerIndustry = (req: Request, res: Response) => {
  registerUser({ ...req.body, role: 'industry' }, res);
};


// For Admin User Management
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.query().select('id', 'name', 'email', 'role', 'active');
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
    // Ensure password is not updated through this endpoint
    const { password, ...updateData } = req.body;
    
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
