import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { Input, Button, App, Form as AntdForm, Typography, Card, Spin, Row, Col, DatePicker, Divider } from 'antd';
import * as PatientService from '@/http/PatientHttpService';
import { Patient } from '@/@types/patient';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { MaskedAntdInput } from '@/components/Form/MaskedAntdInput';

dayjs.extend(utc);

const { Title } = Typography;

const phoneMask = [
  {
    mask: '(00) 0000-0000',
    maxLength: 10,
  },
  {
    mask: '(00) 00000-0000',
  },
];

const cpfMask = '000.000.000-00';

// Form validation
const validate = (values: any) => {
  const errors: any = {};
  if (!values.name?.trim()) {
    errors.name = 'Name is required';
  }
  return errors;
};

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
    } else if (!values.date_of_birth) {
      submissionValues.date_of_birth = null;
    }
    mutation.mutate(submissionValues);
  };

  if (isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" tip="Loading patient data..." />
        </div>
      </Card>
    );
  }

  const initialValues = isEditMode && patient
    ? { 
        ...patient, 
        date_of_birth: patient.date_of_birth ? dayjs.utc(patient.date_of_birth) : undefined,
        phone: patient.phone || '',
        cpf: patient.cpf || '',
      }
    : {
        phone: '',
        cpf: '',
      };

  return (
    <Card>
      <Title level={3}>{isEditMode ? 'Edit Patient' : 'Create Patient'}</Title>
      <Form
        onSubmit={onSubmit}
        initialValues={initialValues}
        validate={validate}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Title level={4}>Personal Information</Title>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Field name="name">
                  {({ input, meta }) => (
                    <AntdForm.Item 
                      label="Full Name" 
                      required 
                      validateStatus={meta.touched && meta.error ? 'error' : ''} 
                      help={meta.touched && meta.error}
                    >
                      <Input {...input} placeholder="Enter full name" />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
              <Col xs={24} sm={12}>
                <Field name="email">
                  {({ input }) => (
                    <AntdForm.Item label="Email">
                      <Input {...input} type="email" placeholder="Enter email address" />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Field name="cpf">
                  {({ input }) => (
                    <AntdForm.Item label="CPF">
                      <MaskedAntdInput
                        {...input}
                        mask={cpfMask}
                        unmask={true}
                        placeholder="000.000.000-00"
                      />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
              <Col xs={24} sm={12}>
                <Field name="rg">
                  {({ input }) => (
                    <AntdForm.Item label="RG">
                      <Input {...input} placeholder="Enter RG" />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Field name="date_of_birth">
                  {({ input }) => (
                    <AntdForm.Item label="Date of Birth">
                      <DatePicker 
                        {...input} 
                        style={{ width: '100%' }} 
                        format="DD/MM/YYYY" 
                        placeholder="Select date of birth"
                      />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
              <Col xs={24} sm={12}>
                <Field name="phone">
                  {({ input }) => (
                    <AntdForm.Item label="Phone">
                      <MaskedAntdInput
                        {...input}
                        mask={phoneMask}
                        unmask={true}
                        placeholder="(XX) XXXXX-XXXX"
                      />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
            </Row>

            <Divider />
            <Title level={4}>Responsible Person (Optional)</Title>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Field name="responsible_name" render={({ input }) => <AntdForm.Item label="Responsible Name"><Input {...input} /></AntdForm.Item>} />
              </Col>
              <Col xs={24} sm={12}>
                <Field name="responsible_cpf">
                  {({ input }) => (
                    <AntdForm.Item label="Responsible CPF">
                      <MaskedAntdInput
                        {...input}
                        mask={cpfMask}
                        unmask={true}
                        placeholder="000.000.000-00"
                      />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
            </Row>

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
