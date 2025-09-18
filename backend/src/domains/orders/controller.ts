import { Request, Response } from 'express';
import { Order } from './model';
import { transaction } from 'objection';
import { InsolePrescription } from '../prescriptions/model';
import { InsoleModel } from '../insole-models/model';

// Mock external service calls
const calculateShipping = async (cep: string, items: any[]) => {
  console.log('Mocking shipping calculation for CEP:', cep, 'with items:', items.length);
  return {
    sedex: { carrier: 'SEDEX', price: 35.50, deadline: 3 },
    pac: { carrier: 'PAC', price: 22.90, deadline: 7 },
  };
};

const processPayment = async (paymentData: any, totalValue: number) => {
  console.log('Mocking payment processing for total:', totalValue, 'with data:', paymentData);
  return {
    success: true,
    transactionId: `txn_${Date.now()}`,
    message: 'Payment successful',
  };
};

// Physiotherapist Controller
export const getShippingOptions = async (req: Request, res: Response) => {
  try {
    const { cep, prescriptionIds } = req.body;
    // @ts-ignore
    const physiotherapistId = req.user.id;

    if (!cep || !prescriptionIds || !Array.isArray(prescriptionIds) || prescriptionIds.length === 0) {
      return res.status(400).json({ message: 'CEP and at least one prescription ID are required.' });
    }

    // In a real scenario, you'd fetch prescription details to get weight/dimensions
    const prescriptions = await InsolePrescription.query()
      .whereIn('id', prescriptionIds)
      .withGraphFetched('insoleModel');
      
    // Basic validation to ensure all prescriptions belong to the physio
    const patientIds = prescriptions.map(p => p.patient_id);
    // This is a simplified check. A more robust check would join through patients table.
    if (prescriptions.length !== prescriptionIds.length) {
        return res.status(404).json({ message: 'One or more prescriptions not found.' });
    }

    const items = prescriptions.map(p => ({
        weight: p.insoleModel?.weight || 200, // default weight in grams
        // other dimensions if needed by the shipping API
    }));

    const shippingOptions = await calculateShipping(cep, items);
    res.json(shippingOptions);
  } catch (error: any) {
    res.status(500).json({ message: 'Error calculating shipping', error: error.message });
  }
};

export const createCheckout = async (req: Request, res: Response) => {
  const trx = await transaction.start(Order.knex());
  try {
    const { prescriptionIds, shipping, payment, observations } = req.body;
    // @ts-ignore
    const physiotherapistId = req.user.id;

    const prescriptions = await InsolePrescription.query(trx)
      .whereIn('id', prescriptionIds)
      .withGraphFetched('insoleModel');

    if (prescriptions.length !== prescriptionIds.length) {
      await trx.rollback();
      return res.status(404).json({ message: 'One or more prescriptions not found.' });
    }

    const orderValue = prescriptions.reduce((sum, p) => sum + (p.insoleModel?.sell_value || 0), 0);
    const freightValue = shipping.price || 0;
    const totalValue = orderValue + freightValue;

    // Mock payment processing
    const paymentResult = await processPayment(payment, totalValue);
    if (!paymentResult.success) {
      await trx.rollback();
      return res.status(400).json({ message: 'Payment failed', details: paymentResult.message });
    }

    const newOrder = await Order.query(trx).insert({
      physiotherapist_id: physiotherapistId,
      order_value: orderValue,
      freight_value: freightValue,
      total_value: totalValue,
      payment_method: payment.method,
      gateway_id: paymentResult.transactionId,
      transaction_date: new Date().toISOString(),
      status: 'PROCESSING', // Assuming payment is successful
      observations,
    });

    for (const prescription of prescriptions) {
      await newOrder.$relatedQuery('prescriptions', trx).relate(prescription.id);
    }

    await trx.commit();
    res.status(201).json(newOrder);
  } catch (error: any) {
    await trx.rollback();
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

export const listPhysioOrders = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const physiotherapistId = req.user.id;
    const orders = await Order.query()
      .where('physiotherapist_id', physiotherapistId)
      .withGraphFetched('prescriptions.patient')
      .orderBy('order_date', 'desc');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Industry/Admin Controller
export const listAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.query()
      .withGraphFetched('[physiotherapist(selectName), prescriptions.patient(selectName)]')
      .modifiers({
        selectName(builder) {
          builder.select('name');
        }
      })
      .orderBy('order_date', 'desc');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching all orders', error: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.query().patchAndFetchById(id, { status });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // TODO: Implement email notification to the physiotherapist
    console.log(`Order ${id} status updated to ${status}. Send email to physiotherapist ID ${order.physiotherapist_id}`);

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// Admin-only Controller
export const batchUpdateStatus = async (req: Request, res: Response) => {
  try {
    const { orderIds, status } = req.body;
    const updatedCount = await Order.query()
      .whereIn('id', orderIds)
      .patch({ status });

    // TODO: Implement batch email notifications
    console.log(`${updatedCount} orders updated to ${status}. Send batch emails.`);

    res.json({ message: `${updatedCount} orders updated successfully.` });
  } catch (error: any) {
    res.status(500).json({ message: 'Error in batch update', error: error.message });
  }
};

export const exportOrdersToCsv = async (req: Request, res: Response) => {
  // In a real app, use a library like 'papaparse' or 'fast-csv'
  res.header('Content-Type', 'text/csv');
  res.attachment('orders.csv');
  res.send('id,date,status,physiotherapist,total_value\n1,2024-09-17,PROCESSING,"Dr. Smith",150.00');
};
