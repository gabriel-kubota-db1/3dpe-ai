import { Route } from 'react-router-dom';
import DashboardPage from '../pages/Dashboard';
import ListPatientsPage from '../pages/PatientManagement/ListPatients';
import PatientFormPage from '../pages/PatientManagement/PatientForm';
import ListPrescriptionsPage from '../pages/PrescriptionManagement/ListPrescriptions';
import PrescriptionFormPage from '../pages/PrescriptionManagement/PrescriptionForm';
import PrescriptionDetailsPage from '../pages/PrescriptionManagement/PrescriptionDetails';
import CheckoutPage from '../pages/Checkout';
import MyOrdersPage from '../pages/MyOrders/ListOrders';
import OrderDetailsPage from '../pages/MyOrders/OrderDetails';
import ProfilePage from '../pages/Profile';

// EAD Pages
import CourseListPage from '../pages/EAD/CourseList';
import CourseDetailsPage from '../pages/EAD/CourseDetails';

const physiotherapistRoutes = (
  <>
    <Route path="/physiotherapist/dashboard" element={<DashboardPage />} />
    <Route path="/physiotherapist/patients" element={<ListPatientsPage />} />
    <Route path="/physiotherapist/patients/new" element={<PatientFormPage />} />
    <Route path="/physiotherapist/patients/edit/:id" element={<PatientFormPage />} />
    <Route path="/physiotherapist/prescriptions" element={<ListPrescriptionsPage />} />
    <Route path="/physiotherapist/prescriptions/new" element={<PrescriptionFormPage />} />
    <Route path="/physiotherapist/prescriptions/edit/:id" element={<PrescriptionFormPage />} />
    <Route path="/physiotherapist/prescriptions/details/:id" element={<PrescriptionDetailsPage />} />
    <Route path="/physiotherapist/checkout" element={<CheckoutPage />} />
    <Route path="/physiotherapist/my-orders" element={<MyOrdersPage />} />
    <Route path="/physiotherapist/my-orders/:id" element={<OrderDetailsPage />} />
    <Route path="/physiotherapist/profile" element={<ProfilePage />} />

    {/* EAD Routes */}
    <Route path="/physiotherapist/ead/courses" element={<CourseListPage />} />
    <Route path="/physiotherapist/ead/courses/:id" element={<CourseDetailsPage />} />
  </>
);

export default physiotherapistRoutes;
