import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupDatabase } from './config/database';

// Import routers
import userRoutes from './domains/users/routes';
import insoleModelsRoutes from './domains/insoleModels/routes';
import physiotherapistsRoutes from './domains/physiotherapists/routes';
import industriesRoutes from './domains/industries/routes';
import patientRoutes from './domains/patients/routes';
import prescriptionRoutes from './domains/prescriptions/routes';

const app = express();
const port = process.env.PORT || 3001;

// Setup Database
setupDatabase();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/insole-models', insoleModelsRoutes);
app.use('/api/physiotherapists', physiotherapistsRoutes);
app.use('/api/industries', industriesRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);


app.get('/', (req, res) => {
  res.send('3DPé Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
