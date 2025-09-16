import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { FormSpy } from 'react-final-form';
import { Input, Button, App, Form as AntdForm, Typography, Card, Spin, Row, Col, Select, Checkbox, InputNumber } from 'antd';
import { useNavigate } from 'react-router-dom';
import * as PatientService from '@/http/PatientHttpService';
import * as InsoleModelService from '@/http/InsoleModelHttpService';
import * as PrescriptionService from '@/http/PrescriptionHttpService';
import * as CoatingService from '@/http/CoatingHttpService';
import { Patient } from '@/@types/patient';
import { InsoleModel } from '@/@types/insole';
import { Coating, CoatingType } from '@/@types/coating';
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
  const [selectedCoatingType, setSelectedCoatingType] = useState<CoatingType | null>(null);

  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[], Error>({
    queryKey: ['patients'],
    queryFn: PatientService.getPatients,
  });

  const { data: insoleModels, isLoading: isLoadingModels } = useQuery<InsoleModel[], Error>({
    queryKey: ['insoleModels'],
    queryFn: InsoleModelService.getInsoleModels,
  });

  const { data: filteredCoatings, isLoading: isLoadingCoatings } = useQuery<Coating[], Error>({
    queryKey: ['coatings', selectedCoatingType],
    queryFn: () => CoatingService.getCoatings(selectedCoatingType!),
    enabled: !!selectedCoatingType,
  });

  const { mutate: createPrescription, isPending } = useMutation({
    mutationFn: (values: any) => {
        const { patient_id, insole_model_id, numeration, coating_id, ...rest } = values;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { coating_type, ...palmilhogram } = rest;
        const payload = { patient_id, insole_model_id, numeration, coating_id, palmilhogram };
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
        render={({ handleSubmit, values, form }) => (
          <form onSubmit={handleSubmit}>
            <Row gutter={24}>
              <Col xs={24} md={6}>
                <Field name="patient_id" render={({ input }) => <AntdForm.Item label="Patient" required><Select {...input} placeholder="Select a patient">{patients?.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}</Select></AntdForm.Item>} />
              </Col>
              <Col xs={24} md={6}>
                <Field name="insole_model_id" render={({ input }) => <AntdForm.Item label="Insole Model" required><Select {...input} placeholder="Select a model">{insoleModels?.map(m => <Option key={m.id} value={m.id}>{m.name}</Option>)}</Select></AntdForm.Item>} />
              </Col>
              <Col xs={24} md={6}>
                <Field name="coating_type" render={({ input }) => <AntdForm.Item label="Coating Type" required><Select {...input} placeholder="Select coating type" onChange={(value) => { input.onChange(value); setSelectedCoatingType(value); form.change('coating_id', undefined); }}><Option value="EVA">EVA</Option><Option value="Fabric">Fabric</Option></Select></AntdForm.Item>} />
              </Col>
              <Col xs={24} md={6}>
                <Field name="coating_id" render={({ input }) => <AntdForm.Item label="Coating" required><Select {...input} placeholder="Select a coating" loading={isLoadingCoatings} disabled={!selectedCoatingType}>{filteredCoatings?.map(c => <Option key={c.id} value={c.id}>{c.description}</Option>)}</Select></AntdForm.Item>} />
              </Col>
              <Col xs={24}>
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
