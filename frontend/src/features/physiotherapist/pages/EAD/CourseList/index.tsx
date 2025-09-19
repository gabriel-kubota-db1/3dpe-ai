import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Typography, Spin, Empty, Tag } from 'antd';
import { Link } from 'react-router-dom';
import * as EadService from '@/http/EadHttpService';
import { Course } from '@/@types/ead';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const CourseListPage = () => {
  const { data: courses, isLoading, error } = useQuery<Course[], Error>({
    queryKey: ['physioCourses'],
    // Fetch only active courses for physiotherapists
    queryFn: () => EadService.getAllCourses().then(allCourses => allCourses.filter(c => c.status)),
  });

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div>;
  }

  if (error) {
    return <Paragraph type="danger">Error fetching courses: {error.message}</Paragraph>;
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Available Courses</Title>
      {!courses || courses.length === 0 ? (
        <Empty description="No courses are available at the moment." />
      ) : (
        <Row gutter={[16, 16]}>
          {courses.map(course => (
            <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
              <Link to={`/physiotherapist/courses/${course.id}`}>
                <Card
                  hoverable
                  cover={
                    <img 
                      alt={course.name} 
                      src={course.cover_url || 'https://images.pexels.com/photos/355948/pexels-photo-355948.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'} 
                      style={{ height: 200, objectFit: 'cover' }} 
                    />
                  }
                >
                  <Meta
                    title={course.name}
                    description={
                      <>
                        {course.category && <Tag color="blue">{course.category.name}</Tag>}
                        <Paragraph ellipsis={{ rows: 2, expandable: false }} style={{ marginTop: 8 }}>
                          {course.description}
                        </Paragraph>
                      </>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default CourseListPage;
