import { Route } from 'react-router-dom';
import UserProfilePage from '../pages/UserProfile';

const commonRoutes = [
  <Route key="profile" path="/profile" element={<UserProfilePage />} />,
];

export default commonRoutes;