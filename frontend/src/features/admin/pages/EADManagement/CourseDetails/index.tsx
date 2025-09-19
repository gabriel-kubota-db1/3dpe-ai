import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Typography, Spin, Alert } from 'antd';
import * as EadService from '@/http/EadHttpService';
// We will create this component next
// import CourseStructureManager from './CourseStructureManager'; 

const { Title } = Typography;

const EADCourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id!, 10);

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['eadCourseDetails', courseId],
    queryFn: () => EadService.getCourseDetails(courseId),
    enabled: !!courseId,
  });

  if (isLoading) {
    return <Spin tip="Loading course structure..." />;
  }

  if (error) {
    return <Alert message="Error" description={error.message} type="error" showIcon />;
  }

  return (
    <div>
      <Title level={3}>Manage Course: {course?.name}</Title>
      <p>{course?.description}</p>
      {/* The drag-and-drop component will go here */}
      <p>Drag and drop functionality for modules and lessons will be implemented here.</p>
    </div>
  );
};

export default EADCourseDetailsPage;
