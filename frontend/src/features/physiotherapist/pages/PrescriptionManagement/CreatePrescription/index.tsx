import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { FormSpy } from 'react-final-form';
import { Input, Button, App, Form as AntdForm, Typography, Card, Spin, Row, Col, Select, Checkbox, InputNumber } from 'antd';
import { useNavigate } from 'react-router-dom';
import * as PatientService from '@/http/PatientHttpService';
import * as InsoleModelService from '@/http/InsoleModelHttpService';
import * as PrescriptionService from '@/http/PrescriptionHttpService';
import { Patient } from '@/@types/patient';
import { InsoleModel } from '@/@types/insoleModel';
import FootSvg from './FootSvg';

const { Title } = Typography;
const { Option } = Select;

const PalmilhogramField = ({ name, label, values }: { name: string, label: string, values: any }) => (
  <Row align="middle" style={{ marginBottom: 8 }}>
    <Col span={12}>
      <Field name={name} type="checkbox">
        {({ input }) => <Checkbox {...input}>{label}</Checkbox>}
      </Field>
    </Col>
    <Col span={12}>
      {values[name] && (
        <Field name={`${name}_value`}>
          {({ input }) => <InputNumber {...input} min={1} placeholder="mm" style={{ width: '100%' }} />}
        </Field>
      )}
    </Col>
  </Row>
);

const CreatePrescriptionPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[], Error>({
    queryKey: ['patients'],
    queryFn: PatientService.getPatients,
  });

  const { data: insoleModels, isLoading: isLoadingModels } = useQuery<InsoleModel[], Error>({
    queryKey: ['insoleModels'],
    queryFn: InsoleModelService.getInsoleModels,
  });

  const { mutate: createPrescription, isPending } = useMutation({
    mutationFn: (values: any) => {
        const { patient_id, insole_model_id, numeration, ...palmilhogram } = values;
        const payload = { patient_id, insole_model_id, numeration, palmilhogram };
        return PrescriptionService.createPrescription(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      message.success('Prescription created successfully!');
      navigate('/physiotherapist/prescriptions');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to create prescription.');
    },
  });

  const onSubmit = (values: any) => {
    createPrescription(values);
  };

  if (isLoadingPatients || isLoadingModels) {
    return <Spin tip="Loading data..." />;
  }

  return (
    <Card>
      <Title level={3}>New Prescription</Title>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit}>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Field name="patient_id" render={({ input }) => <AntdForm.Item label="Patient" required><Select {...input} placeholder="Select a patient">{patients?.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}</Select></AntdForm.Item>} />
              </Col>
              <Col xs={24} md={8}>
                <Field name="insole_model_id" render={({ input }) => <AntdForm.Item label="Insole Model" required><Select {...input} placeholder="Select a model">{insoleModels?.map(m => <Option key={m.id} value={m.id}>{m.description}</Option>)}</Select></AntdForm.Item>} />
              </Col>
              <Col xs={24} md={8}>
                <Field name="numeration" render={({ input }) => <AntdForm.Item label="Numeration (Shoe Size)" required><Input {...input} /></AntdForm.Item>} />
              </Col>
            </Row>

            <Title level={4} style={{ marginTop: 24 }}>Palmilhogram</Title>
            
            <Row gutter={32}>
                <Col xs={24} md={12}>
                    <Title level={5}>Left Foot</Title>
                    <PalmilhogramField name="cic_left" label="CIC" values={values} />
                    <PalmilhogramField name="cavr_left" label="CAVR" values={values} />
                    <PalmilhogramField name="medial_longitudinal_arch_left" label="Medial Arch" values={values} />
                    <PalmilhogramField name="lateral_longitudinal_arch_left" label="Lateral Arch" values={values} />
                    <PalmilhogramField name="transverse_arch_left" label="Transverse Arch" values={values} />
                    <PalmilhogramField name="calcaneus_left" label="Calcaneus" values={values} />
                </Col>
                <Col xs={24} md={12}>
                    <Title level={5}>Right Foot</Title>
                    <PalmilhogramField name="cic_right" label="CIC" values={values} />
                    <PalmilhogramField name="cavr_right" label="CAVR" values={values} />
                    <PalmilhogramField name="medial_longitudinal_arch_right" label="Medial Arch" values={values} />
                    <PalmilhogramField name="lateral_longitudinal_arch_right" label="Lateral Arch" values={values} />
                    <PalmilhogramField name="transverse_arch_right" label="Transverse Arch" values={values} />
                    <PalmilhogramField name="calcaneus_right" label="Calcaneus" values={values} />
                </Col>
            </Row>

            <FormSpy subscription={{ values: true }}>
              {({ values }) => <FootSvg values={values} />}
            </FormSpy>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Button onClick={() => navigate('/physiotherapist/prescriptions')} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isPending}>
                Create Prescription
              </Button>
            </div>
          </form>
        )}
      />
    </Card>
  );
};

export default CreatePrescriptionPage;
