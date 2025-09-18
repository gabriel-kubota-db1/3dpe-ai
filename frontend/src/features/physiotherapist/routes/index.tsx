import { PrivateRoute } from '@/routes/PrivateRoute';
import { PhysiotherapistDashboard } from '../pages/Dashboard';
import { CreatePatientPage } from '../pages/PatientManagement/CreatePatient';
import { ListPatientsPage } from '../pages/PatientManagement/ListPatients';
import { EditPatientPage } from '../pages/PatientManagement/EditPatient';
import { CreatePrescriptionPage } from '../pages/PrescriptionManagement/CreatePrescription';
import { ListPrescriptionsPage } from '../pages/PrescriptionManagement/ListPrescriptions';
import { EditPrescriptionPage } from '../pages/PrescriptionManagement/EditPrescription';
import ListOrdersPage from '../pages/OrderManagement/ListOrders';
import CheckoutPage from '../pages/OrderManagement/Checkout';
import OrderDetailsPage from '../pages/OrderManagement/OrderDetails';

export const physiotherapistRoutes = [
  {
    path: '/physiotherapist',
    element: (
      <PrivateRoute roles={['physiotherapist']}>
        <PhysiotherapistDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: '/physiotherapist/patients',
    element: (
      <PrivateRoute roles={['physiotherapist']}>
        <ListPatientsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/physiotherapist/patients/create',
    element: (
      <PrivateRoute roles={['physiotherapist']}>
        <CreatePatientPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/physiotherapist/patients/edit/:id',
    element: (
      <PrivateRoute roles={['physiotherapist']}>
        <EditPatientPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/physiotherapist/prescriptions',
    element: (
      <PrivateRoute roles={['physiotherapist']}>
        <ListPrescriptionsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/physiotherapist/prescriptions/create/:patientId',
    element: (
      <PrivateRoute roles={['physiotherapist']}>
        <CreatePrescriptionPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/physiotherapist/prescriptions/edit/:id',
    element: (
      <PrivateRoute roles={['physiotherapist']}>
        <EditPrescriptionPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/physiotherapist/orders',
    element: (
      <PrivateRoute roles={['physiotherapist']}>
        <ListOrdersPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/physiotherapist/orders/checkout',
    element: (
      <PrivateRoute roles={['physiotherapist']}>
        <CheckoutPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/physiotherapist/orders/:id',
    element: (
      <PrivateRoute roles={['physiotherapist']}>
        <OrderDetailsPage />
      </PrivateRoute>
    ),
  },
];
