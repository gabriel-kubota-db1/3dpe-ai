import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Model } from 'objection';
import knexConfig from '../knexfile';
import Knex from 'knex';

// Import domain routers
import userRoutes from './domains/users/routes';
import coatingRoutes from './domains/coatings/routes';
import insoleModelRoutes from './domains/insole-models/routes';
import discountCouponRoutes from './domains/discount-coupons/routes';

const app = express();
const port = process.env.PORT || 3000;

// Initialize Knex and Objection
const knex = Knex(knexConfig.development);
Model.knex(knex);

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/coatings', coatingRoutes);
app.use('/api/insole-models', insoleModelRoutes);
app.use('/api/discount-coupons', discountCouponRoutes);

// Health check
app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
