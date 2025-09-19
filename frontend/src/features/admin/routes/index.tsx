import { Route } from 'react-router-dom';
import CoatingPage from '../pages/CoatingManagement';
import InsoleModelPage from '../pages/InsoleModelManagement';
import CouponPage from '../pages/CouponManagement';

// Import User Management pages
import UserListPage from '../pages/UserManagement/ListUsers';
import UserFormPage from '../pages/UserManagement/UseForm';
import ListOrdersPage from '../pages/OrderManagement/ListOrders';
import OrderDetailsPage from '../pages/OrderManagement/OrderDetails';
import DashboardPage from '../pages/Dashboard';
import ProductionReportPage from '../pages/ProductionReport';
import ListAdminPrescriptionsPage from '../pages/PrescriptionManagement/ListPrescriptions';

// Import EAD Management pages
import EADCourseListPage from '../pages/EADManagement/ListCourses';
import EADCourseDetailsPage from '../pages/EADManagement/CourseDetails';

const adminRoutes = (
  <>
    <Route path="/admin/dashboard" element={<DashboardPage />} />
    <Route path="/admin/production-report" element={<ProductionReportPage />} />
    <Route path="/admin/users" element={<UserListPage />} />
    <Route path="/admin/users/new" element={<UserFormPage />} />
    <Route path="/admin/users/edit/:id" element={<UserFormPage />} />
    <Route path="/admin/coatings" element={<CoatingPage />} />
    <Route path="/admin/insole-models" element={<InsoleModelPage />} />
    <Route path="/admin/coupons" element={<CouponPage />} />
    <Route path="/admin/orders" element={<ListOrdersPage />} />
    <Route path="/admin/orders/:id" element={<OrderDetailsPage />} />
    <Route path="/admin/prescriptions" element={<ListAdminPrescriptionsPage />} />

    {/* EAD Routes */}
    <Route path="/admin/courses" element={<EADCourseListPage />} />
    <Route path="/admin/courses/:id" element={<EADCourseDetailsPage />} />
  </>
);

export default adminRoutes;
