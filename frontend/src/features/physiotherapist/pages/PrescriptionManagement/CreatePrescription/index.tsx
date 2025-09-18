import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input, Button, App, Form as AntdForm, Typography, Card, Spin, Row, Col, Select, Steps } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import * as PatientService from '@/http/PatientHttpService';
import * as InsoleModelService from '@/http/InsoleModelHttpService';
import * as PrescriptionService from '@/http/PrescriptionHttpService';
import { Patient } from '@/@types/patient';
import { InsoleModel } from '@/@types/insoleModel';
import { Prescription } from '@/@types/prescription';
import { PalmilhogramaConfigurator } from '@/features/physiotherapist/components/PalmilhogramaConfigurator';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface FormData {
  patient_id?: number;
  insole_model_id?: number;
  numeration?: string;
  status?: string;
  observations?: string;
  palmilhogram?: any;
}

interface ValidationErrors {
  patient_id?: string;
  insole_model_id?: string;
  numeration?: string;
  status?: string;
  observations?: string;
}

const PrescriptionForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    status: 'DRAFT',
    palmilhogram: {},
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

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

  // Initialize form data when editing
  useEffect(() => {
    if (isEditMode && prescription) {
      setFormData({
        ...prescription,
        palmilhogram: prescription.palmilogram || {},
      });
    }
  }, [isEditMode, prescription]);

  const { mutate: createPrescription, isPending: isCreating } = useMutation({
    mutationFn: (values: any) => PrescriptionService.createPrescription(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      message.success('Prescription created successfully!');
      navigate('/physiotherapist/prescriptions');
    },
    onError: (error: any) => {
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
    onError: (error: any) => {
      message.error(error.message || 'Failed to update prescription.');
    },
  });

  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!formData.patient_id) {
      newErrors.patient_id = 'Patient is required';
    }
    
    if (!formData.insole_model_id) {
      newErrors.insole_model_id = 'Insole model is required';
    }
    
    if (!formData.numeration) {
      newErrors.numeration = 'Numeration is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (field in errors && errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const nextStep = () => {
    if (currentStep === 0) {
      if (validateStep1()) {
        setCurrentStep(1);
      }
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  const prevStep = () => setCurrentStep(s => s - 1);

  const onSubmit = () => {
    if (!validateStep1()) {
      setCurrentStep(0);
      return;
    }

    // Ensure we send palmilhogram (with 'h') as the backend expects
    const processedValues = {
      ...formData,
      // Make sure we're sending the correct field name
      palmilhogram: formData.palmilhogram || {}
    };
    
    if (isEditMode) {
      updatePrescription(processedValues);
    } else {
      createPrescription(processedValues);
    }
  };

  if (isLoadingPatients || isLoadingModels || (isEditMode && isLoadingPrescription)) {
    return <Spin tip="Loading data..." />;
  }

  return (
    <Card>
      <Title level={3}>{isEditMode ? 'Edit' : 'New'} Prescription</Title>
      <Steps current={currentStep} style={{ margin: '24px 0' }}>
        <Steps.Step title="Basic Information" />
        <Steps.Step title="Palmilhograma" />
      </Steps>

      {/* Step 1: Basic Information */}
      {currentStep === 0 && (
        <div>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <AntdForm.Item 
                label="Patient" 
                required 
                validateStatus={errors.patient_id ? 'error' : ''} 
                help={errors.patient_id}
              >
                <Select
                  value={formData.patient_id}
                  onChange={(value) => handleFieldChange('patient_id', value)}
                  showSearch
                  optionFilterProp="children"
                  placeholder="Select a patient"
                >
                  {patients?.map(p => (
                    <Option key={p.id} value={p.id}>{p.name}</Option>
                  ))}
                </Select>
              </AntdForm.Item>
            </Col>
            <Col xs={24} md={12}>
              <AntdForm.Item 
                label="Insole Model" 
                required 
                validateStatus={errors.insole_model_id ? 'error' : ''} 
                help={errors.insole_model_id}
              >
                <Select
                  value={formData.insole_model_id}
                  onChange={(value) => handleFieldChange('insole_model_id', value)}
                  showSearch
                  optionFilterProp="children"
                  placeholder="Select an insole model"
                >
                  {insoleModels?.map(m => (
                    <Option key={m.id} value={m.id}>{m.description}</Option>
                  ))}
                </Select>
              </AntdForm.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <AntdForm.Item 
                label="Numeration" 
                required 
                validateStatus={errors.numeration ? 'error' : ''} 
                help={errors.numeration}
              >
                <Input
                  value={formData.numeration}
                  onChange={(e) => handleFieldChange('numeration', e.target.value)}
                  placeholder="e.g., 38/39"
                />
              </AntdForm.Item>
            </Col>
            <Col xs={24} md={12}>
              <AntdForm.Item label="Status" required>
                <Select
                  value={formData.status}
                  onChange={(value) => handleFieldChange('status', value)}
                >
                  <Option value="DRAFT">Draft</Option>
                  <Option value="ACTIVE">Active</Option>
                  <Option value="CANCELED">Canceled</Option>
                  <Option value="COMPLETED">Completed</Option>
                </Select>
              </AntdForm.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <AntdForm.Item label="Observations">
                <TextArea
                  value={formData.observations}
                  onChange={(e) => handleFieldChange('observations', e.target.value)}
                  rows={4}
                />
              </AntdForm.Item>
            </Col>
          </Row>
        </div>
      )}

      {/* Step 2: Palmilhograma */}
      {currentStep === 1 && (
        <div>
          <PalmilhogramaConfigurator
            data={formData.palmilhogram || {}}
            onChange={(newValue) => handleFieldChange('palmilhogram', newValue)}
          />
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        {currentStep > 0 && (
          <Button style={{ marginRight: 8 }} onClick={prevStep}>
            Previous
          </Button>
        )}
        {currentStep < 1 && (
          <Button type="primary" onClick={nextStep}>
            Next
          </Button>
        )}
        {currentStep === 1 && (
          <Button type="primary" onClick={onSubmit} loading={isCreating || isUpdating}>
            {isEditMode ? 'Update Prescription' : 'Create Prescription'}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default PrescriptionForm;
