import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, message, Space, Tag, Statistic } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { getCategories, getAllCourses } from '@/http/EadHttpService';
import { Course } from '@/@types/ead';

interface CategoryInfo {
  name: string;
  courseCount: number;
  courses: Course[];
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);

  useEffect(() => {
    loadCategoriesAndCourses();
  }, []);

  const loadCategoriesAndCourses = async () => {
    setLoading(true);
    try {
      const [, coursesData] = await Promise.all([
        getCategories(),
        getAllCourses()
      ]);
      
      // Group courses by category
      const categoryMap = new Map<string, Course[]>();
      
      coursesData.forEach(course => {
        if (course.category) {
          if (!categoryMap.has(course.category)) {
            categoryMap.set(course.category, []);
          }
          categoryMap.get(course.category)!.push(course);
        }
      });
      
      const categoryInfos: CategoryInfo[] = Array.from(categoryMap.entries()).map(([name, coursesInCategory]) => ({
        name,
        courseCount: coursesInCategory.length,
        courses: coursesInCategory
      }));
      
      setCategories(categoryInfos);
    } catch (error) {
      message.error('Failed to load categories and courses');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourses = (category: CategoryInfo) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: 'Course Count',
      dataIndex: 'courseCount',
      key: 'courseCount',
      render: (count: number) => (
        <Statistic value={count} suffix="courses" />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CategoryInfo) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewCourses(record)}
          >
            View Courses
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Course Categories"
        extra={
          <Button
            type="primary"
            onClick={loadCategoriesAndCourses}
            loading={loading}
          >
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="name"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={`Courses in "${selectedCategory?.name}" Category`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedCategory && (
          <Table
            dataSource={selectedCategory.courses}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'Course Name',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
                render: (text: string) => text || '-',
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default CategoryManagement;
