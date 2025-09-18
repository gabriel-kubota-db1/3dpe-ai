import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const PhysiotherapistDashboard = () => {
  return (
    <Card>
      <Title level={2}>Physiotherapist Dashboard</Title>
      <Paragraph>
        Welcome to your dashboard. From here you can manage your patients, prescriptions, and orders.
      </Paragraph>
    </Card>
  );
};

export default PhysiotherapistDashboard;
