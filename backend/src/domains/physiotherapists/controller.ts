import { Request, Response } from 'express';
import { Physiotherapist } from './model';
import { User } from '../users/model';
import { raw } from 'objection';

export const getProductionReport = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, search } = req.query;

    const query = User.query()
      .select(
        'users.id',
        'users.name',
        'users.document',
        raw('count(orders.id) as order_count'),
        raw('sum(orders.total_value) as total_value'),
        raw('max(orders.order_date) as last_order_date')
      )
      .join('orders', 'users.id', 'orders.physiotherapist_id')
      .where('users.role', 'physiotherapist')
      .groupBy('users.id', 'users.name', 'users.document');

    if (start_date && typeof start_date === 'string') {
      query.where('orders.order_date', '>=', start_date);
    }

    if (end_date && typeof end_date === 'string') {
      query.where('orders.order_date', '<=', end_date);
    }

    if (search && typeof search === 'string') {
      query.where(builder => {
        builder.where('users.name', 'like', `%${search}%`)
          .orWhere('users.document', 'like', `%${search}%`);
      });
    }

    const report = await query.orderBy('total_value', 'desc');

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching production report', error: error.message });
  }
};
