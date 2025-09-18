import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Card, Typography, App } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as PrescriptionService from '@/http/PrescriptionHttpService';
import { Prescription } from '@/@types/prescription';
import dayjs from 'dayjs';

const { Title } = Typography;

const SelectPrescriptionsPage = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { data: prescriptions, isLoading } = useQuery<Prescription[], Error>({
    queryKey: ['prescriptionsForOrder'],
    queryFn: PrescriptionService.getPrescriptions,
    // Filter for prescriptions that can be ordered
    select: (data) => data.filter(p => p.status === 'ACTIVE' || p.status === 'COMPLETED'),
  });

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleCreateOrder = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one prescription to create an order.');
      return;
    }
    // Pass selected prescription IDs to the checkout page via state
    navigate('/physiotherapist/orders/checkout', { state: { prescriptionIds: selectedRowKeys } });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: 'Patient',
      dataIndex: ['patient', 'name'],
      key: 'patient',
    },
    {
      title: 'Insole Model',
      dataIndex: ['insoleModel', 'description'],
      key: 'insoleModel',
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3}>Select Prescriptions for Order</Title>
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          disabled={selectedRowKeys.length === 0}
          onClick={handleCreateOrder}
        >
          Create Order ({selectedRowKeys.length})
        </Button>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={prescriptions}
        loading={isLoading}
        rowKey="id"
      />
    </Card>
  );
};

export default SelectPrescriptionsPage;
