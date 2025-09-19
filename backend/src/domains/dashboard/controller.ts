import { Request, Response } from 'express';
import { User } from '../users/model';
import { Patient } from '../patients/model';
import { Order } from '../orders/model';
import { raw } from 'objection';
import dayjs from 'dayjs';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    // 1. Total Patients
    const totalPatients = await Patient.query().where('active', true).resultSize();

    // 2. Total Revenue (Current Month)
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');
    const monthlyRevenueResult = await Order.query()
      .whereBetween('order_date', [startOfMonth, endOfMonth])
      .andWhere('status', '!=', 'CANCELED')
      .sum('total_value as total')
      .first();
    const monthlyRevenue = (monthlyRevenueResult as any)?.total || 0;

    // 3. New Orders (Current Month)
    const newOrdersCount = await Order.query()
      .whereBetween('order_date', [startOfMonth, endOfMonth])
      .resultSize();

    // 4. Recent Orders (Last 5)
    const recentOrders = await Order.query()
      .withGraphFetched('physiotherapist(selectName)')
      .modifiers({
        selectName(builder) {
          builder.select('name');
        }
      })
      .orderBy('order_date', 'desc')
      .limit(5);

    // 5. Revenue Chart Data (Last 12 Months)
    const twelveMonthsAgo = dayjs().subtract(11, 'months').startOf('month').format('YYYY-MM-DD');
    const revenueByMonth = await Order.query()
      .select(
        raw("DATE_FORMAT(order_date, '%Y-%m') as month"),
        raw('sum(total_value) as revenue')
      )
      .where('order_date', '>=', twelveMonthsAgo)
      .andWhere('status', '!=', 'CANCELED')
      .groupBy('month')
      .orderBy('month', 'asc');

    // Format for chart
    const chartData = Array.from({ length: 12 }).map((_, i) => {
      const date = dayjs().subtract(11 - i, 'months');
      const monthKey = date.format('YYYY-MM');
      const monthName = date.format('MMM YY');
      const dataPoint = revenueByMonth.find((r: any) => r.month === monthKey);
      return {
        name: monthName,
        revenue: dataPoint ? parseFloat((dataPoint as any).revenue) : 0,
      };
    });

    res.json({
      totalPatients,
      monthlyRevenue,
      newOrdersCount,
      recentOrders,
      chartData,
    });

  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching dashboard metrics', error: error.message });
  }
};
