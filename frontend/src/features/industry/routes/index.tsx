import { Route } from 'react-router-dom';
import ListOrdersPage from '../pages/OrderManagement/ListOrders';

const industryRoutes = (
  <Route path="industry">
    <Route path="orders" element={<ListOrdersPage />} />
  </Route>
);

export default industryRoutes;
