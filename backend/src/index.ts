import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupDatabase } from './config/database';

// Import domain routers
import userRoutes from './domains/users/routes';
import authRoutes from './domains/auth/routes';
import coatingRoutes from './domains/coatings/routes';
import insoleModelRoutes from './domains/insole-models/routes';
import couponRoutes from './domains/coupons/routes';

const app = express();
const port = process.env.PORT || 3000;

// Setup Database
setupDatabase();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/coatings', coatingRoutes);
app.use('/api/insole-models', insoleModelRoutes);
app.use('/api/coupons', couponRoutes);


app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
