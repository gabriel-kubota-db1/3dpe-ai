import { Route } from 'react-router-dom';
import ListOrdersPage from '../pages/OrderManagement/ListOrders';
import OrderDetailsPage from '../pages/OrderManagement/OrderDetails';

const adminRoutes = [
  <Route key="admin" path="admin" element={<ListOrdersPage />} />,
  <Route key="admin-orders" path="admin/orders" element={<ListOrdersPage />} />,
  <Route key="admin-order-details" path="admin/orders/:id" element={<OrderDetailsPage />} />,
];

export default adminRoutes;
