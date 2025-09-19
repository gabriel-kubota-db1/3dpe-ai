import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Typography, Spin, Alert, Input } from 'antd';
import { Link } from 'react-router-dom';
import * as EadService from '@/http/EadHttpService';
import { Course } from '@/@types/ead';
import { useState } from 'react';

const { Title } = Typography;
const { Meta } = Card;
const { Search } = Input;

const CourseListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: courses, isLoading, error } = useQuery<Course[], Error>({
    queryKey: ['eadCourses'],
    queryFn: EadService.getAllCourses,
  });

  const filteredCourses = courses?.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <Spin tip="Loading courses..." />;
  }

  if (error) {
    return <Alert message="Error" description={error.message} type="error" showIcon />;
  }

  return (
    <div>
      <Title level={3}>Universidade 3DPé</Title>
      <Search
        placeholder="Search courses by name or category"
        onSearch={value => setSearchTerm(value)}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ marginBottom: 24 }}
        enterButton
      />
      <Row gutter={[16, 16]}>
        {filteredCourses?.map(course => (
          <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
            <Link to={`/physiotherapist/ead/courses/${course.id}`}>
              <Card
                hoverable
                cover={<img alt={course.name} src={course.cover_url || 'https://via.placeholder.com/300x200?text=No+Image'} style={{ height: 200, objectFit: 'cover' }} />}
              >
                <Meta title={course.name} description={course.category?.name || 'Uncategorized'} />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CourseListPage;
