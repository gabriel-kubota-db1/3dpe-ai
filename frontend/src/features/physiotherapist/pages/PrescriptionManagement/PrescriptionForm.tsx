import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { Input, Button, App, Form as AntdForm, Typography, Card, Spin, Row, Col, Select, Steps, InputNumber } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import * as PatientService from '@/http/PatientHttpService';
import * as InsoleModelService from '@/http/InsoleModelHttpService';
import * as PrescriptionService from '@/http/PrescriptionHttpService';
import { Patient } from '@/@types/patient';
import { InsoleModel } from '@/@types/insoleModel';
import { Prescription } from '@/@types/prescription';
import { PalmilhogramaConfigurator } from '../../components/PalmilhogramaConfigurator';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PalmilhogramaAdapter = ({ input: { value, onChange } }: any) => (
    <PalmilhogramaConfigurator data={value || {}} onChange={onChange} />
);

const PrescriptionForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);

  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[], Error>({
    queryKey: ['patients'],
    queryFn: PatientService.getPatients,
  });

  const { data: insoleModels, isLoading: isLoadingModels } = useQuery<InsoleModel[], Error>({
    queryKey: ['insoleModels'],
    queryFn: InsoleModelService.getInsoleModels,
  });

  const { data: prescription, isLoading: isLoadingPrescription } = useQuery<Prescription, Error>({
    queryKey: ['prescription', id],
    queryFn: () => PrescriptionService.getPrescription(Number(id)),
    enabled: isEditMode,
  });

  const { mutate: createPrescription, isPending: isCreating } = useMutation({
    mutationFn: (values: any) => PrescriptionService.createPrescription(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      message.success('Prescription created successfully!');
      navigate('/physiotherapist/prescriptions');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to create prescription.');
    },
  });

  const { mutate: updatePrescription, isPending: isUpdating } = useMutation({
    mutationFn: (values: any) => PrescriptionService.updatePrescription(Number(id), values),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
        queryClient.invalidateQueries({ queryKey: ['prescription', id] });
        message.success('Prescription updated successfully!');
        navigate('/physiotherapist/prescriptions');
    },
    onError: (error) => {
        message.error(error.message || 'Failed to update prescription.');
    },
  });

  const onSubmit = (values: any) => {
    if (isEditMode) {
        updatePrescription(values);
    } else {
        createPrescription(values);
    }
  };

  const nextStep = () => setCurrentStep(s => s + 1);
  const prevStep = () => setCurrentStep(s => s - 1);

  if (isLoadingPatients || isLoadingModels || isLoadingPrescription) {
    return <Spin tip="Loading data..." />;
  }

  const initialValues = isEditMode && prescription ? {
    ...prescription,
    palmilhogram: prescription.palmilogram || {},
  } : {
    status: 'DRAFT',
    palmilhogram: {},
  };

  return (
    <Card>
      <Title level={3}>{isEditMode ? 'Edit' : 'New'} Prescription</Title>
      <Steps current={currentStep} style={{ margin: '24px 0' }}>
        <Steps.Step title="Basic Information" />
        <Steps.Step title="Palmilhograma" />
      </Steps>
      <Form
        onSubmit={onSubmit}
        initialValues={initialValues}
        render={({ handleSubmit, values, form }) => (
          <form onSubmit={handleSubmit}>
            {currentStep === 0 && (
              <div>
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Field name="patient_id" render={({ input }) => (
                      <AntdForm.Item label="Patient" required>
                        <Select {...input} placeholder="Select a patient" loading={isLoadingPatients}>
                          {patients?.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                        </Select>
                      </AntdForm.Item>
                    )} />
                  </Col>
                  <Col xs={24} md={12}>
                    <Field name="insole_model_id" render={({ input }) => (
                      <AntdForm.Item label="Insole Model" required>
                        <Select {...input} placeholder="Select an insole model" loading={isLoadingModels}>
                          {insoleModels?.map(m => <Option key={m.id} value={m.id}>{m.description}</Option>)}
                        </Select>
                      </AntdForm.Item>
                    )} />
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Field name="numeration" render={({ input }) => (
                      <AntdForm.Item label="Numeration (Shoe Size)" required>
                        <InputNumber {...input} style={{ width: '100%' }} min={10} max={50} />
                      </AntdForm.Item>
                    )} />
                  </Col>
                   <Col xs={24} md={12}>
                    <Field name="status" render={({ input }) => (
                      <AntdForm.Item label="Status" required>
                        <Select {...input}>
                            <Option value="DRAFT">Draft</Option>
                            <Option value="PENDING">Pending</Option>
                            <Option value="COMPLETED">Completed</Option>
                        </Select>
                      </AntdForm.Item>
                    )} />
                  </Col>
                </Row>
                <Field name="observations" render={({ input }) => (
                  <AntdForm.Item label="Observations">
                    <TextArea {...input} rows={4} placeholder="Enter any observations" />
                  </AntdForm.Item>
                )} />
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <Field name="palmilhogram" component={PalmilhogramaAdapter} />
              </div>
            )}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
              {currentStep > 0 && (
                <Button onClick={prevStep}>
                  Previous
                </Button>
              )}
              <div />
              {currentStep < 1 && (
                <Button type="primary" onClick={nextStep}>
                  Next
                </Button>
              )}
              {currentStep === 1 && (
                <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                  {isEditMode ? 'Update' : 'Create'} Prescription
                </Button>
              )}
            </div>
          </form>
        )}
      />
    </Card>
  );
};

export default PrescriptionForm;
