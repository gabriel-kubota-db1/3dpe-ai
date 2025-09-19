import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Card, Typography, DatePicker, Input, Row, Col, Button, Space } from 'antd';
import { ProductionReportRecord } from '@/@types/physiotherapist';
import * as PhysiotherapistService from '@/http/PhysiotherapistHttpService';
import { useDebounce } from '@/hooks/useDebounce';
import dayjs, { Dayjs } from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ProductionReportPage = () => {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [filters, setFilters] = useState<{
    start_date?: string;
    end_date?: string;
    search?: string;
  }>({});

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearchTerm || undefined }));
  }, [debouncedSearchTerm]);

  const { data: reportData, isLoading } = useQuery<ProductionReportRecord[], Error>({
    queryKey: ['productionReport', filters],
    queryFn: () => PhysiotherapistService.getProductionReport(filters),
  });

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
    if (dates && dates[0] && dates[1]) {
      setFilters(prev => ({
        ...prev,
        start_date: dates[0]!.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        end_date: dates[1]!.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      }));
    } else {
      setFilters(prev => ({ ...prev, start_date: undefined, end_date: undefined }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const setFilterPreset = (period: 'day' | 'month' | 'year') => {
    const start = dayjs().startOf(period);
    const end = dayjs().endOf(period);
    setDateRange([start, end]);
    handleDateChange([start, end]);
  };

  const columns = [
    { title: 'Physiotherapist', dataIndex: 'name', key: 'name', sorter: (a: any, b: any) => a.name.localeCompare(b.name) },
    { title: 'Document', dataIndex: 'document', key: 'document' },
    { title: 'Order Count', dataIndex: 'order_count', key: 'order_count', sorter: (a: any, b: any) => a.order_count - b.order_count, render: (count: number) => count || 0 },
    { title: 'Total Value', dataIndex: 'total_value', key: 'total_value', sorter: (a: any, b: any) => a.total_value - b.total_value, render: (value: number) => `R$ ${(Number(value) || 0).toFixed(2)}` },
    { title: 'Last Order Date', dataIndex: 'last_order_date', key: 'last_order_date', render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-' },
  ];

  return (
    <Card>
      <Title level={3}>Physiotherapist Production Report</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Input
            placeholder="Search by Name or Document"
            value={searchTerm}
            onChange={handleSearchChange}
            allowClear
          />
        </Col>
        <Col xs={24} md={12}>
          <Space wrap>
            <RangePicker value={dateRange} onChange={handleDateChange} />
            <Button onClick={() => setFilterPreset('day')}>Today</Button>
            <Button onClick={() => setFilterPreset('month')}>This Month</Button>
            <Button onClick={() => setFilterPreset('year')}>This Year</Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={reportData}
        loading={isLoading}
        rowKey="id"
        summary={pageData => {
          let totalValue = 0;
          let totalOrders = 0;
          pageData.forEach(({ total_value, order_count }) => {
            totalValue += Number(total_value) || 0;
            totalOrders += Number(order_count) || 0;
          });
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}><strong>Total</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={1}></Table.Summary.Cell>
              <Table.Summary.Cell index={2}><strong>{totalOrders}</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={3}><strong>R$ {totalValue.toFixed(2)}</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={4}></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </Card>
  );
};

export default ProductionReportPage;
