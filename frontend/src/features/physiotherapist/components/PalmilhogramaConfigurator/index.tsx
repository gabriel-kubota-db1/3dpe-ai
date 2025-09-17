import { useEffect, useState } from 'react';
import { Row, Col, InputNumber, Typography, Form } from 'antd';
import { Palmilhogram } from '@/@types/prescription';

const { Title, Text } = Typography;

interface PalmilhogramaConfiguratorProps {
  data: Partial<Palmilhogram>;
  onChange: (data: Partial<Palmilhogram>) => void;
  readOnly?: boolean;
}

const fieldsConfig = [
    { key: 'cic', label: 'CIC' },
    { key: 'cavr', label: 'CAVR' },
    { key: 'cavr_total', label: 'CAVR Total' },
    { key: 'cavr_prolonged', label: 'CAVR Prolongado' },
    { key: 'cavl', label: 'CAVL' },
    { key: 'cavl_total', label: 'CAVL Total' },
    { key: 'cavl_prolonged', label: 'CAVL Prolongado' },
    { key: 'brc', label: 'BRC' },
    { key: 'boton', label: 'Boton' },
    { key: 'bic', label: 'BIC' },
    { key: 'longitudinal_arch', label: 'Arco Longitudinal' },
];

export const PalmilhogramaConfigurator = ({ data, onChange, readOnly = false }: PalmilhogramaConfiguratorProps) => {
  const [values, setValues] = useState(data);

  useEffect(() => {
    setValues(data);
  }, [data]);

  const handleChange = (field: string, value: number | null) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    onChange(newValues);
  };

  const renderFields = (side: 'left' | 'right') => {
    return fieldsConfig.map(field => (
      <Col xs={24} sm={12} md={8} key={`${field.key}_${side}`}>
        <Form.Item label={<Text strong>{field.label}</Text>}>
          <InputNumber
            style={{ width: '100%' }}
            value={values[`${field.key}_${side}` as keyof Palmilhogram] as number}
            onChange={(value) => handleChange(`${field.key}_${side}`, value)}
            disabled={readOnly}
            min={0}
            max={10}
            step={1}
          />
        </Form.Item>
      </Col>
    ));
  };

  return (
    <div>
      <Title level={4}>Left Foot</Title>
      <Row gutter={[16, 16]}>{renderFields('left')}</Row>
      <Title level={4} style={{ marginTop: 24 }}>Right Foot</Title>
      <Row gutter={[16, 16]}>{renderFields('right')}</Row>
    </div>
  );
};
