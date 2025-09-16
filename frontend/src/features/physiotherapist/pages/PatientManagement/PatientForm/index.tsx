import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { Input, Button, App, Form as AntdForm, Typography, Card, Spin, Row, Col } from 'antd';
import * as PatientService from '@/http/PatientHttpService';
import { Patient } from '@/@types/patient';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const { Title } = Typography;

const PatientFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: patient, isLoading } = useQuery<Patient, Error>({
    queryKey: ['patient', id],
    queryFn: () => PatientService.getPatient(Number(id)),
    enabled: isEditMode,
  });

  const mutation = useMutation({
    mutationFn: (values: Partial<Patient>) => {
      return isEditMode
        ? PatientService.updatePatient(Number(id), values)
        : PatientService.createPatient(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      message.success(`Patient ${isEditMode ? 'updated' : 'created'} successfully!`);
      navigate('/physiotherapist/patients');
    },
    onError: (error) => {
      message.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} patient.`);
    },
  });

  const onSubmit = (values: any) => {
    const submissionValues = { ...values };
    if (values.date_of_birth && dayjs.isDayjs(values.date_of_birth)) {
      submissionValues.date_of_birth = values.date_of_birth.format('YYYY-MM-DD');
    }
    mutation.mutate(submissionValues);
  };

  if (isLoading) {
    return <Spin tip="Loading patient data..." />;
  }

  const initialValues = isEditMode && patient
    ? { ...patient, date_of_birth: patient.date_of_birth ? dayjs(patient.date_of_birth) : undefined }
    : {};

  return (
    <Card>
      <Title level={3}>{isEditMode ? 'Edit Patient' : 'Create Patient'}</Title>
      <Form
        onSubmit={onSubmit}
        initialValues={initialValues}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Field name="name">
                  {({ input }) => (
                    <AntdForm.Item label="Full Name" required>
                      <Input {...input} />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
              <Col xs={24} sm={12}>
                <Field name="email">
                  {({ input }) => (
                    <AntdForm.Item label="Email">
                      <Input {...input} type="email" />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
            </Row>
            {/* Add all other patient fields here similarly */}
            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Button onClick={() => navigate('/physiotherapist/patients')} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={mutation.isPending}>
                {isEditMode ? 'Update Patient' : 'Create Patient'}
              </Button>
            </div>
          </form>
        )}
      />
    </Card>
  );
};

export default PatientFormPage;
