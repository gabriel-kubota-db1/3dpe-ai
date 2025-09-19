import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Row, Col, Typography, Spin, Alert, Collapse, List, Button, Progress, Rate, Form as AntdForm, Input, App } from 'antd';
import { CheckCircleFilled, PlayCircleOutlined } from '@ant-design/icons';
import * as EadService from '@/http/EadHttpService';
import { Course, Lesson, CourseProgress } from '@/@types/ead';
import { Form, Field } from 'react-final-form';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const CourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id!, 10);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: course, isLoading: isLoadingCourse } = useQuery<Course, Error>({
    queryKey: ['eadCourseDetails', courseId],
    queryFn: () => EadService.getCourseDetails(courseId),
    enabled: !!courseId,
    onSuccess: (data) => {
      if (!activeLesson && data.modules?.[0]?.lessons?.[0]) {
        setActiveLesson(data.modules[0].lessons[0]);
      }
    }
  });

  const { data: progressData, isLoading: isLoadingProgress } = useQuery<CourseProgress[], Error>({
    queryKey: ['myEadProgress'],
    queryFn: EadService.getMyCoursesProgress,
  });

  const courseProgress = progressData?.find(p => p.ead_course_id === courseId);

  const { mutate: markAsComplete } = useMutation({
    mutationFn: (lessonId: number) => EadService.updateMyProgress(courseId, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEadProgress'] });
      message.success('Progress updated!');
    },
  });

  const { mutate: submitEvaluation } = useMutation({
    mutationFn: (values: { rating: number; comment: string }) => EadService.evaluateCourse(courseId, values.rating, values.comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEadProgress'] });
      message.success('Thank you for your feedback!');
    },
  });

  const handleEvaluationSubmit = (values: any) => {
    submitEvaluation({ rating: values.evaluation, comment: values.evaluation_comment });
  };

  if (isLoadingCourse || isLoadingProgress) {
    return <Spin tip="Loading course..." />;
  }

  if (!course) {
    return <Alert message="Error" description="Course not found." type="error" showIcon />;
  }

  const isLessonCompleted = (lessonId: number) => {
    return courseProgress?.completed_lessons.includes(lessonId) || false;
  };

  return (
    <div>
      <Title level={3}>{course.name}</Title>
      <Progress percent={courseProgress?.progress || 0} style={{ marginBottom: 24 }} />
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Title level={5}>Course Content</Title>
          <Collapse defaultActiveKey={course.modules?.[0]?.id}>
            {course.modules?.map(module => (
              <Panel header={module.title} key={module.id}>
                <List
                  dataSource={module.lessons}
                  renderItem={lesson => (
                    <List.Item
                      onClick={() => setActiveLesson(lesson)}
                      style={{ cursor: 'pointer', background: activeLesson?.id === lesson.id ? '#e6f7ff' : 'transparent' }}
                    >
                      {isLessonCompleted(lesson.id) ? <CheckCircleFilled style={{ color: 'green', marginRight: 8 }} /> : <PlayCircleOutlined style={{ marginRight: 8 }} />}
                      {lesson.title}
                    </List.Item>
                  )}
                />
              </Panel>
            ))}
          </Collapse>
        </Col>
        <Col xs={24} md={16}>
          {activeLesson ? (
            <div>
              <Title level={4}>{activeLesson.title}</Title>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: 16 }}>
                <iframe
                  src={activeLesson.url}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  title={activeLesson.title}
                ></iframe>
              </div>
              {!isLessonCompleted(activeLesson.id) && (
                <Button type="primary" onClick={() => markAsComplete(activeLesson.id)}>
                  Mark as Complete
                </Button>
              )}
            </div>
          ) : (
            <Text>Select a lesson to begin.</Text>
          )}

          {courseProgress?.status === 'COMPLETED' && (
            <div style={{ marginTop: 32 }}>
              <Title level={5}>Evaluate this course</Title>
              <Form
                onSubmit={handleEvaluationSubmit}
                initialValues={{ evaluation: courseProgress.evaluation, evaluation_comment: courseProgress.evaluation_comment }}
                render={({ handleSubmit }) => (
                  <form onSubmit={handleSubmit}>
                    <Field name="evaluation">
                      {({ input }) => <AntdForm.Item label="Your Rating"><Rate {...input} /></AntdForm.Item>}
                    </Field>
                    <Field name="evaluation_comment">
                      {({ input }) => <AntdForm.Item label="Comments"><Input.TextArea {...input} rows={3} /></AntdForm.Item>}
                    </Field>
                    <Button type="primary" htmlType="submit">Submit Feedback</Button>
                  </form>
                )}
              />
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CourseDetailsPage;
