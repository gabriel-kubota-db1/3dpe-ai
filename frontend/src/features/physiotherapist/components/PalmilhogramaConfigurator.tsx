import { Row, Col, Typography, Switch, InputNumber, Card, Divider } from 'antd';
import { Palmilhogram } from '@/@types/prescription';

interface PalmilhogramaConfiguratorProps {
  data: Partial<Palmilhogram>;
  onChange: (newData: Partial<Palmilhogram>) => void;
}

interface MetricInputProps {
  label: string;
  fieldName: keyof Palmilhogram;
  value?: number | null;
  onValueChange: (field: keyof Palmilhogram, value: number | null) => void;
}

const MetricInput = ({ label, fieldName, value, onValueChange }: MetricInputProps) => {
  const isEnabled = value != null;

  const handleSwitchChange = (checked: boolean) => {
    onValueChange(fieldName, checked ? 0 : null);
  };

  const handleInputChange = (newValue: number | null) => {
    onValueChange(fieldName, newValue);
  };

  return (
    <Row align="middle" style={{ marginBottom: 12, width: '100%' }}>
      <Col xs={14} sm={16}>
        <Switch checked={isEnabled} onChange={handleSwitchChange} size="small" style={{ marginRight: 8 }} />
        <Typography.Text>{label}</Typography.Text>
      </Col>
      <Col xs={10} sm={8}>
        <InputNumber
          style={{ width: '100%' }}
          disabled={!isEnabled}
          value={value}
          onChange={handleInputChange}
          step="0.1"
          precision={2}
        />
      </Col>
    </Row>
  );
};

const footMetrics: { label: string; field: keyof Palmilhogram }[] = [
    { label: 'CIC', field: 'cic_left' },
    { label: 'CAVR', field: 'cavr_left' },
    { label: 'CAVR Total', field: 'cavr_total_left' },
    { label: 'CAVR Prolongado', field: 'cavr_prolonged_left' },
    { label: 'CAVL', field: 'cavl_left' },
    { label: 'CAVL Total', field: 'cavl_total_left' },
    { label: 'CAVL Prolongado', field: 'cavl_prolonged_left' },
    { label: 'BRC', field: 'brc_left' },
    { label: 'Boton', field: 'boton_left' },
    { label: 'BIC', field: 'bic_left' },
    { label: 'Arco Longitudinal', field: 'longitudinal_arch_left' },
];

export const PalmilhogramaConfigurator = ({ data, onChange }: PalmilhogramaConfiguratorProps) => {
  const handleValueChange = (field: keyof Palmilhogram, value: number | null) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={12}>
        <Card title="Left Foot">
          {footMetrics.map(metric => (
            <MetricInput
              key={metric.field}
              label={metric.label}
              fieldName={metric.field}
              value={data[metric.field]}
              onValueChange={handleValueChange}
            />
          ))}
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Right Foot">
          {footMetrics.map(metric => {
            const rightField = metric.field.replace('_left', '_right') as keyof Palmilhogram;
            return (
              <MetricInput
                key={rightField}
                label={metric.label}
                fieldName={rightField}
                value={data[rightField]}
                onValueChange={handleValueChange}
              />
            );
          })}
        </Card>
      </Col>
    </Row>
  );
};
