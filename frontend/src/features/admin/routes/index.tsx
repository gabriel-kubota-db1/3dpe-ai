import { Route } from 'react-router-dom';
import CoatingPage from '../pages/CoatingManagement';
import InsoleModelPage from '../pages/InsoleModelManagement';
import CouponPage from '../pages/CouponManagement';

// Import User Management pages
import UserListPage from '../pages/UserManagement/ListUsers';
import UserFormPage from '../pages/UserManagement/UserForm';

const adminRoutes = (
  <>
    <Route path="/admin/users" element={<UserListPage />} />
    <Route path="/admin/users/new" element={<UserFormPage />} />
    <Route path="/admin/users/edit/:id" element={<UserFormPage />} />
    <Route path="/admin/coatings" element={<CoatingPage />} />
    <Route path="/admin/insole-models" element={<InsoleModelPage />} />
    <Route path="/admin/coupons" element={<CouponPage />} />
  </>
);

export default adminRoutes;
