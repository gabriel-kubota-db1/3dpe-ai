import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupDatabase } from './config/database';

// Import routers
import userRoutes from './domains/users/routes';
import insoleModelsRoutes from './domains/insole-models/routes';
import patientRoutes from './domains/patients/routes';
import prescriptionRoutes from './domains/prescriptions/routes';
import couponRoutes from './domains/coupons/routes';
import authRoutes from './domains/auth/routes';
import coatingsRoutes from './domains/coatings/routes';
import orderRoutes from './domains/orders/routes';

const app = express();
const port = process.env.PORT || 3001;

// Setup Database
setupDatabase();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/insole-models', insoleModelsRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/coatings', coatingsRoutes);
app.use('/api/orders', orderRoutes);


app.get('/', (req, res) => {
  res.send('3DPé Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
