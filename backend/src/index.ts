import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupDatabase } from './config/database.js';
import { env } from './config/env.js';

import authRoutes from './domains/auth/routes.js';
import userRoutes from './domains/users/routes.js';

const app = express();
const port = env.PORT;

// Setup Database
setupDatabase();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('3DPé Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
