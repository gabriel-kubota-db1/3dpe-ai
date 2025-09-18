import { RouteObject } from 'react-router-dom';
import ListOrdersPage from '../pages/OrderManagement/ListOrders';
import OrderDetailsPage from '../pages/OrderManagement/OrderDetails';

const adminRoutes: RouteObject[] = [
  {
    path: 'orders',
    children: [
      {
        index: true,
        element: <ListOrdersPage />,
      },
      {
        path: ':id',
        element: <OrderDetailsPage />,
      },
    ],
  },
];

export default adminRoutes;
