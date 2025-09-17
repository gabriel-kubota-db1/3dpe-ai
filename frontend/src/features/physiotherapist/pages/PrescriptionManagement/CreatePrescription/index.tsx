import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { Input, Button, App, Form as AntdForm, Typography, Card, Spin, Row, Col, Select, Steps } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import * as PatientService from '@/http/PatientHttpService';
import * as InsoleModelService from '@/http/InsoleModelHttpService';
import * as PrescriptionService from '@/http/PrescriptionHttpService';
import { Patient } from '@/@types/patient';
import { InsoleModel } from '@/@types/insoleModel';
import { Prescription } from '@/@types/prescription';
import { PalmilhogramaConfigurator } from '../../../components/PalmilhogramaConfigurator';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Adapter to connect PalmilhogramaConfigurator with React Final Form's Field component
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
    queryFn: () => PatientService.getPatients(),
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

  const initialValues = useMemo(() => (isEditMode && prescription ? {
    ...prescription,
    palmilhogram: prescription.palmilogram || {},
  } : {
    status: 'DRAFT',
    palmilhogram: {},
  }), [isEditMode, prescription]);

  const [formData, setFormData] = useState(initialValues);

  useEffect(() => {
    // When initialValues are loaded (e.g., for edit mode), update formData
    setFormData(initialValues);
  }, [initialValues]);


  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ['prescription', id] });
        message.success('Prescription updated successfully!');
      } else {
        message.success('Prescription created successfully!');
      }
      navigate('/physiotherapist/prescriptions');
    },
    onError: (error: Error) => {
      message.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} prescription.`);
    },
  };

  const { mutate: createPrescription, isPending: isCreating } = useMutation({
    mutationFn: (values: any) => PrescriptionService.createPrescription(values),
    ...mutationOptions,
  });

  const { mutate: updatePrescription, isPending: isUpdating } = useMutation({
    mutationFn: (values: any) => PrescriptionService.updatePrescription(Number(id), values),
    ...mutationOptions,
  });

  const onSubmit = (values: any) => {
    // Filter out null values from palmilhogram before submitting
    const cleanedPalmilhogram = { ...values.palmilhogram };
    Object.keys(cleanedPalmilhogram).forEach(key => {
        if (cleanedPalmilhogram[key] === null) {
            delete cleanedPalmilhogram[key];
        }
    });

    const submissionValues = { ...values, palmilhogram: cleanedPalmilhogram };

    if (isEditMode) {
        updatePrescription(submissionValues);
    } else {
        createPrescription(submissionValues);
    }
  };

  const next = (values: any) => {
    setFormData(values);
    setCurrentStep(s => s + 1);
  };

  const prev = (values: any) => {
    setFormData(values);
    setCurrentStep(s => s - 1);
  };

  if (isLoadingPatients || isLoadingModels || (isEditMode && isLoadingPrescription)) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin tip="Loading data..." /></div>;
  }

  return (
    <Card>
      <Title level={3}>{isEditMode ? 'Edit' : 'New'} Prescription</Title>
      <Steps current={currentStep} style={{ margin: '24px 0' }}>
        <Steps.Step title="Basic Information" />
        <Steps.Step title="Palmilhograma" />
      </Steps>
      <Form
        onSubmit={onSubmit}
        initialValues={formData}
        render={({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit}>
            <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Field name="patient_id" render={({ input, meta }) => <AntdForm.Item label="Patient" required validateStatus={meta.touched && meta.error ? 'error' : ''} help={meta.touched && meta.error}><Select {...input} placeholder="Select a patient">{patients?.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}</Select></AntdForm.Item>} />
                </Col>
                <Col xs={24} md={12}>
                  <Field name="insole_model_id" render={({ input, meta }) => <AntdForm.Item label="Insole Model" required validateStatus={meta.touched && meta.error ? 'error' : ''} help={meta.touched && meta.error}><Select {...input} placeholder="Select a model">{insoleModels?.map(m => <Option key={m.id} value={m.id}>{m.description}</Option>)}</Select></AntdForm.Item>} />
                </Col>
              </Row>
              <Row gutter={24}>
                  <Col xs={24} md={12}>
                      <Field name="numeration" render={({ input, meta }) => <AntdForm.Item label="Numeration (Shoe Size)" required validateStatus={meta.touched && meta.error ? 'error' : ''} help={meta.touched && meta.error}><Input {...input} /></AntdForm.Item>} />
                  </Col>
                  <Col xs={24} md={12}>
                      <Field name="status" render={({ input, meta }) => <AntdForm.Item label="Status" required validateStatus={meta.touched && meta.error ? 'error' : ''} help={meta.touched && meta.error}><Select {...input}><Option value="DRAFT">Draft</Option><Option value="ACTIVE">Active</Option><Option value="CANCELED">Canceled</Option><Option value="COMPLETED">Completed</Option></Select></AntdForm.Item>} />
                  </Col>
              </Row>
              <Row>
                  <Col span={24}>
                      <Field name="observations" render={({ input, meta }) => <AntdForm.Item label="Observations" validateStatus={meta.touched && meta.error ? 'error' : ''} help={meta.touched && meta.error}><TextArea {...input} rows={4} /></AntdForm.Item>} />
                  </Col>
              </Row>
            </div>

            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                <Field name="palmilhogram" component={PalmilhogramaAdapter} />
            </div>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Button onClick={() => navigate('/physiotherapist/prescriptions')} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              {currentStep > 0 && (
                <Button onClick={() => prev(values)} style={{ marginRight: 8 }}>
                  Previous
                </Button>
              )}
              {currentStep < 1 && (
                <Button type="primary" onClick={() => next(values)}>
                  Next
                </Button>
              )}
              {currentStep === 1 && (
                <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                  {isEditMode ? 'Update Prescription' : 'Create Prescription'}
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
