import { Request, Response } from 'express';
import { Order } from './model';
import { transaction } from 'objection';
import { InsolePrescription } from '../prescriptions/model';
import axios from 'axios';

// --- Melhor Envio Integration ---
const calculateShippingWithMelhorEnvio = async (cep: string, items: any[]) => {
  // It's recommended to use environment variables for sensitive data
  const MELHOR_ENVIO_API_URL = process.env.MELHOR_ENVIO_API_URL || 'https://www.melhorenvio.com.br/api/v2/me';
  const MELHOR_ENVIO_API_TOKEN = process.env.MELHOR_ENVIO_API_TOKEN;

  if (!MELHOR_ENVIO_API_TOKEN) {
    console.error('Melhor Envio API token is not configured.');
    // Fallback to mock data if token is missing, to prevent crashing development
    return {
      sedex: { carrier: 'SEDEX (Mock)', price: 35.50, deadline: 3 },
      pac: { carrier: 'PAC (Mock)', price: 22.90, deadline: 7 },
    };
  }

  // Sender information (should be configured for the company)
  const from = {
    postal_code: process.env.SENDER_CEP || '01001000', // 3DPé's CEP
  };

  const to = {
    postal_code: cep.replace(/\D/g, ''),
  };

  // Map prescription items to Melhor Envio product format
  const products = items.map((item, index) => ({
    id: `${index + 1}`,
    width: 15, // Default width in cm
    height: 10, // Default height in cm
    length: 30, // Default length in cm
    weight: (item.weight || 200) / 1000, // Convert grams to kg
    insurance_value: item.insurance_value || 100.0, // Value for insurance
    quantity: 1,
  }));

  const payload = { from, to, products };

  try {
    const response = await axios.post(`${MELHOR_ENVIO_API_URL}/shipment/calculate`, payload, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_API_TOKEN}`,
        'User-Agent': '3DPe App (contato@3dpe.com.br)',
      },
    });

    // Filter out options with errors and format the response
    const validOptions = response.data.filter((opt: any) => !opt.error);

    const formattedOptions: { [key: string]: any } = {};
    validOptions.forEach((opt: any) => {
      const carrierKey = opt.name.toLowerCase().replace(/\s+/g, '_');
      formattedOptions[carrierKey] = {
        id: opt.id,
        carrier: opt.name,
        price: parseFloat(opt.price),
        deadline: parseInt(opt.delivery_time, 10),
        company: opt.company.name,
      };
    });

    return formattedOptions;
  } catch (error: any) {
    console.error('Melhor Envio API Error:', error.response?.data || error.message);
    throw new Error('Failed to calculate shipping with Melhor Envio.');
  }
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

    if (!cep || !prescriptionIds || !Array.isArray(prescriptionIds) || prescriptionIds.length === 0) {
      return res.status(400).json({ message: 'CEP and at least one prescription ID are required.' });
    }

    const prescriptions = await InsolePrescription.query()
      .whereIn('id', prescriptionIds)
      .withGraphFetched('insoleModel');
      
    if (prescriptions.length !== prescriptionIds.length) {
        return res.status(404).json({ message: 'One or more prescriptions not found.' });
    }

    const items = prescriptions.map(p => ({
        weight: p.insoleModel?.weight || 200, // default weight in grams
        insurance_value: p.insoleModel?.sell_value || 100,
    }));

    const shippingOptions = await calculateShippingWithMelhorEnvio(cep, items);
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
