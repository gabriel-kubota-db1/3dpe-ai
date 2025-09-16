import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupDatabase } from './config/database';

// Import routers
import authRoutes from './domains/auth/routes';
import userRoutes from './domains/users/routes';
import coatingRoutes from './domains/coatings/routes';
import couponRoutes from './domains/coupons/routes';
import insoleModelsRoutes from './domains/insole-models/routes';

const app = express();
const port = process.env.PORT || 3000;

// Setup Database
setupDatabase();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coatings', coatingRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/insole-models', insoleModelsRoutes);


app.get('/', (req, res) => {
  res.send('3DPé Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
