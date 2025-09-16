import { Route } from 'react-router-dom';
import PageLayout from '@/components/Layout/PageLayout';

// Patient Management
import ListPatientsPage from '../pages/PatientManagement/ListPatients';
import PatientFormPage from '../pages/PatientManagement/PatientForm';
import PatientDetailsPage from '../pages/PatientManagement/PatientDetails';

// Prescription Management
import ListPrescriptionsPage from '../pages/PrescriptionManagement/ListPrescriptions';
import CreatePrescriptionPage from '../pages/PrescriptionManagement/CreatePrescription';

const physiotherapistRoutes = (
  <Route path="physiotherapist" element={<PageLayout />}>
    {/* Patient Routes */}
    <Route path="patients" element={<ListPatientsPage />} />
    <Route path="patients/new" element={<PatientFormPage />} />
    <Route path="patients/edit/:id" element={<PatientFormPage />} />
    <Route path="patients/details/:id" element={<PatientDetailsPage />} />

    {/* Prescription Routes */}
    <Route path="prescriptions" element={<ListPrescriptionsPage />} />
    <Route path="prescriptions/new" element={<CreatePrescriptionPage />} />
  </Route>
);

export default physiotherapistRoutes;
