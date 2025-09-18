import { Route } from 'react-router-dom';
import ListOrdersPage from '../pages/OrderManagement/ListOrders';
import OrderDetailsPage from '../pages/OrderManagement/OrderDetails';

const industryRoutes = (
  <Route path="industry">
    <Route path="orders" element={<ListOrdersPage />} />
    <Route path="orders/:id" element={<OrderDetailsPage />} />
  </Route>
);

export default industryRoutes;
