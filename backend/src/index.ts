import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Import domain routers
import authRoutes from './domains/auth/routes';
import usersRoutes from './domains/users/routes';
import patientsRoutes from './domains/patients/routes';
import coatingsRoutes from './domains/coatings/routes';
import insoleModelsRoutes from './domains/insole-models/routes';
import prescriptionsRoutes from './domains/prescriptions/routes';
import ordersRoutes from './domains/orders/routes';
import couponsRoutes from './domains/coupons/routes';
import dashboardRoutes from './domains/dashboard/routes';
import physiotherapistsRoutes from './domains/physiotherapists/routes';

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/coatings', coatingsRoutes);
app.use('/api/insole-models', insoleModelsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/physiotherapists', physiotherapistsRoutes);

app.get('/', (req, res) => {
  res.send('3DPé Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
