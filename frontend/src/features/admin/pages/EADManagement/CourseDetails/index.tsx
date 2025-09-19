import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Typography, Spin, Alert, Breadcrumb } from 'antd';
import { HomeOutlined, BookOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import * as EadService from '@/http/EadHttpService';
import CourseStructureManager from './CourseStructureManager';

const { Title } = Typography;

const EADCourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id!, 10);

  const { data: course, isLoading, error, refetch } = useQuery({
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
      <Breadcrumb
        items={[
          { href: '/admin/dashboard', title: <HomeOutlined /> },
          { title: <Link to="/admin/ead/courses"><BookOutlined /><span> Courses</span></Link> },
          { title: course?.name },
        ]}
        style={{ marginBottom: '16px' }}
      />
      <Title level={3}>Manage Course: {course?.name}</Title>
      <p>{course?.description}</p>
      
      {course && <CourseStructureManager course={course} onStructureUpdate={refetch} />}
    </div>
  );
};

export default EADCourseDetailsPage;
