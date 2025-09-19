import { RouteObject } from 'react-router-dom';
import EADCourseListPage from '../pages/EADManagement/ListCourses';
import EADCourseDetailsPage from '../pages/EADManagement/CourseDetails';
import CategoryManagement from '../pages/EADManagement/CategoryManagement';

const eadRoutes: RouteObject[] = [
  {
    path: '/admin/ead/courses',
    element: <EADCourseListPage />,
  },
  {
    path: '/admin/ead/courses/:id',
    element: <EADCourseDetailsPage />,
  },
  {
    path: '/admin/ead/categories',
    element: <CategoryManagement />,
  },
];

export default eadRoutes;
