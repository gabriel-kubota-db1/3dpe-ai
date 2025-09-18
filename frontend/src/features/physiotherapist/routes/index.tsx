import { Route } from 'react-router-dom';

// Dashboard
import PhysiotherapistDashboard from '../pages/Dashboard';

// Patient Management
import ListPatientsPage from '../pages/PatientManagement/ListPatients';
import PatientFormPage from '../pages/PatientManagement/PatientForm';
import PatientDetailsPage from '../pages/PatientManagement/PatientDetails';

// Prescription Management
import ListPrescriptionsPage from '../pages/PrescriptionManagement/ListPrescriptions';
import CreatePrescriptionPage from '../pages/PrescriptionManagement/CreatePrescription';
import PrescriptionDetailsPage from '../pages/PrescriptionManagement/PrescriptionDetails';

// Order Management
import ListOrdersPage from '../pages/OrderManagement/ListOrders';
import CheckoutPage from '../pages/OrderManagement/Checkout';
import OrderDetailsPage from '../pages/OrderManagement/OrderDetails';
import SelectPrescriptionsPage from '../pages/OrderManagement/SelectPrescriptions';

const physiotherapistRoutes = [
  <Route key="physiotherapist-dashboard" path="physiotherapist" element={<PhysiotherapistDashboard />} />,

  // Patient Routes
  <Route key="physiotherapist-patients" path="physiotherapist/patients" element={<ListPatientsPage />} />,
  <Route key="physiotherapist-patients-new" path="physiotherapist/patients/new" element={<PatientFormPage />} />,
  <Route key="physiotherapist-patients-edit" path="physiotherapist/patients/edit/:id" element={<PatientFormPage />} />,
  <Route key="physiotherapist-patients-details" path="physiotherapist/patients/details/:id" element={<PatientDetailsPage />} />,

  // Prescription Routes
  <Route key="physiotherapist-prescriptions" path="physiotherapist/prescriptions" element={<ListPrescriptionsPage />} />,
  <Route key="physiotherapist-prescriptions-new" path="physiotherapist/prescriptions/new" element={<CreatePrescriptionPage />} />,
  <Route key="physiotherapist-prescriptions-edit" path="physiotherapist/prescriptions/edit/:id" element={<CreatePrescriptionPage />} />,
  <Route key="physiotherapist-prescriptions-details" path="physiotherapist/prescriptions/details/:id" element={<PrescriptionDetailsPage />} />,

  // Order Routes
  <Route key="physiotherapist-orders" path="physiotherapist/orders" element={<ListOrdersPage />} />,
  <Route key="physiotherapist-orders-new" path="physiotherapist/orders/new" element={<SelectPrescriptionsPage />} />,
  <Route key="physiotherapist-orders-checkout" path="physiotherapist/orders/checkout" element={<CheckoutPage />} />,
  <Route key="physiotherapist-orders-details" path="physiotherapist/orders/:id" element={<OrderDetailsPage />} />,
];

export default physiotherapistRoutes;
