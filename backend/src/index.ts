import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { knexInstance } from './config/database';
import { Model } from 'objection';

// Import domain routers
import authRoutes from './domains/auth/routes';
import userRoutes from './domains/users/routes';
import patientRoutes from './domains/patients/routes';
import coatingRoutes from './domains/coatings/routes';
import insoleModelRoutes from './domains/insoleModels/routes';
import prescriptionRoutes from './domains/prescriptions/routes';
import orderRoutes from './domains/orders/routes';
import couponRoutes from './domains/coupons/routes';
import eadRoutes from './domains/ead/routes'; // Import EAD routes

Model.knex(knexInstance);

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/coatings', coatingRoutes);
app.use('/api/insole-models', insoleModelRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/ead', eadRoutes); // Use EAD routes

app.get('/', (req, res) => {
  res.send('3DPé Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
