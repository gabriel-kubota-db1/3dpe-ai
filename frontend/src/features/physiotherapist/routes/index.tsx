import { Route } from 'react-router-dom';

// Patient Management
import ListPatientsPage from '../pages/PatientManagement/ListPatients';
import PatientFormPage from '../pages/PatientManagement/PatientForm';
import PatientDetailsPage from '../pages/PatientManagement/PatientDetails';

// Prescription Management
import ListPrescriptionsPage from '../pages/PrescriptionManagement/ListPrescriptions';
import CreatePrescriptionPage from '../pages/PrescriptionManagement/CreatePrescription';
import PrescriptionDetailsPage from '../pages/PrescriptionManagement/PrescriptionDetails';

// Order Management
import SelectPrescriptionsPage from '../pages/OrderManagement/SelectPrescriptions';
import CheckoutPage from '../pages/OrderManagement/Checkout';
import ListOrdersPage from '../pages/OrderManagement/ListOrders';

const physiotherapistRoutes = (
  <Route path="physiotherapist">
    {/* Patient Routes */}
    <Route path="patients" element={<ListPatientsPage />} />
    <Route path="patients/new" element={<PatientFormPage />} />
    <Route path="patients/edit/:id" element={<PatientFormPage />} />
    <Route path="patients/details/:id" element={<PatientDetailsPage />} />

    {/* Prescription Routes */}
    <Route path="prescriptions" element={<ListPrescriptionsPage />} />
    <Route path="prescriptions/new" element={<CreatePrescriptionPage />} />
    <Route path="prescriptions/edit/:id" element={<CreatePrescriptionPage />} />
    <Route path="prescriptions/details/:id" element={<PrescriptionDetailsPage />} />

    {/* Order Routes */}
    <Route path="orders" element={<ListOrdersPage />} />
    <Route path="orders/new" element={<SelectPrescriptionsPage />} />
    <Route path="orders/checkout" element={<CheckoutPage />} />
  </Route>
);

export default physiotherapistRoutes;
