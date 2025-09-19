import { Order } from './order';

export interface DashboardMetrics {
  totalPatients: number;
  monthlyRevenue: number;
  newOrdersCount: number;
  recentOrders: Order[];
  chartData: {
    name: string;
    revenue: number;
  }[];
}
