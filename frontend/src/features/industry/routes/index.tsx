import { Route } from 'react-router-dom';
import ListOrdersPage from '../pages/OrderManagement/ListOrders';
import OrderDetailsPage from '../pages/OrderManagement/OrderDetails';

const industryRoutes = [
  <Route key="industry" path="industry" element={<ListOrdersPage />} />,
  <Route key="industry-orders" path="industry/orders" element={<ListOrdersPage />} />,
  <Route key="industry-order-details" path="industry/orders/:id" element={<OrderDetailsPage />} />,
];

export default industryRoutes;
