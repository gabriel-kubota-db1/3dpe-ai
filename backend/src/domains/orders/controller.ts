import { Request, Response } from 'express';
import { Order } from './model';
import { transaction } from 'objection';
import { InsolePrescription } from '../prescriptions/model';
import axios from 'axios';

// --- Melhor Envio Integration ---
const calculateShippingWithMelhorEnvio = async (cep: string, items: any[]) => {
  const MELHOR_ENVIO_API_URL = process.env.MELHOR_ENVIO_API_URL || 'https://www.melhorenvio.com.br/api/v2/me';
  const MELHOR_ENVIO_API_TOKEN = process.env.MELHOR_ENVIO_API_TOKEN;

  if (!MELHOR_ENVIO_API_TOKEN) {
    console.error('Melhor Envio API token is not configured. Using mock data.');
    return {
      sedex: { carrier: 'SEDEX (Mock)', price: 35.50, deadline: 3, company: { name: 'Correios' } },
      pac: { carrier: 'PAC (Mock)', price: 22.90, deadline: 7, company: { name: 'Correios' } },
    };
  }

  const from = { postal_code: process.env.SENDER_CEP || '01001000' };
  const to = { postal_code: cep.replace(/\D/g, '') };

  const products = items.map((item, index) => ({
    id: `${index + 1}`,
    width: 15, height: 10, length: 30,
    weight: (item.weight || 200) / 1000,
    insurance_value: item.insurance_value || 100.0,
    quantity: 1,
  }));

  try {
    const response = await axios.post(`${MELHOR_ENVIO_API_URL}/shipment/calculate`, { from, to, products }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_API_TOKEN}`,
        'User-Agent': '3DPe App (contato@3dpe.com.br)',
      },
    });

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

// Physiotherapist Controller
export const getShippingOptions = async (req: Request, res: Response) => {
  try {
    const { cep, prescriptionIds } = req.body;
    if (!cep || !prescriptionIds || !Array.isArray(prescriptionIds) || prescriptionIds.length === 0) {
      return res.status(400).json({ message: 'CEP and at least one prescription ID are required.' });
    }
    const prescriptions = await InsolePrescription.query().whereIn('id', prescriptionIds).withGraphFetched('insoleModel');
    if (prescriptions.length !== prescriptionIds.length) {
      return res.status(404).json({ message: 'One or more prescriptions not found.' });
    }
    const items = prescriptions.map(p => ({
      weight: p.insoleModel?.weight || 200,
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

    const prescriptions = await InsolePrescription.query(trx).whereIn('id', prescriptionIds).withGraphFetched('insoleModel');
    if (prescriptions.length !== prescriptionIds.length) {
      await trx.rollback();
      return res.status(404).json({ message: 'One or more prescriptions not found.' });
    }

    const orderValue = prescriptions.reduce((sum, p) => sum + (p.insoleModel?.sell_value || 0), 0);
    const freightValue = shipping.price || 0;
    const totalValue = orderValue + freightValue;

    const newOrder = await Order.query(trx).insert({
      physiotherapist_id: physiotherapistId,
      order_value: orderValue,
      freight_value: freightValue,
      total_value: totalValue,
      payment_method: payment.method,
      status: 'PENDING_PAYMENT',
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

export const getPhysioOrderDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const physiotherapistId = req.user.id;
    const order = await Order.query()
      .findById(id)
      .where('physiotherapist_id', physiotherapistId)
      .withGraphFetched('[prescriptions.[patient, insoleModel], physiotherapist]');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found or you do not have permission to view it.' });
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching order details', error: error.message });
  }
};

export const processMockPayment = async (req: Request, res: Response) => {
  const trx = await transaction.start(Order.knex());
  try {
    const { id } = req.params;
    // @ts-ignore
    const physiotherapistId = req.user.id;

    const order = await Order.query(trx).findById(id).where('physiotherapist_id', physiotherapistId);

    if (!order) {
      await trx.rollback();
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.status !== 'PENDING_PAYMENT') {
      await trx.rollback();
      return res.status(400).json({ message: 'This order is not pending payment.' });
    }

    const updatedOrder = await order.$query(trx).patchAndFetch({
      status: 'PROCESSING',
      transaction_date: new Date().toISOString(),
      gateway_id: `mock_txn_${Date.now()}`
    });

    await trx.commit();
    res.json(updatedOrder);
  } catch (error: any) {
    await trx.rollback();
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
};


// Industry/Admin Controller
export const listAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.query()
      .withGraphFetched('[physiotherapist(selectName), prescriptions.patient(selectName)]')
      .modifiers({ selectName(builder) { builder.select('name'); } })
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
    if (!order) return res.status(404).json({ message: 'Order not found' });
    console.log(`Order ${id} status updated to ${status}. Send email to physiotherapist ID ${order.physiotherapist_id}`);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

export const batchUpdateStatus = async (req: Request, res: Response) => {
  try {
    const { orderIds, status } = req.body;
    const updatedCount = await Order.query().whereIn('id', orderIds).patch({ status });
    console.log(`${updatedCount} orders updated to ${status}. Send batch emails.`);
    res.json({ message: `${updatedCount} orders updated successfully.` });
  } catch (error: any) {
    res.status(500).json({ message: 'Error in batch update', error: error.message });
  }
};

export const exportOrdersToCsv = async (req: Request, res: Response) => {
  res.header('Content-Type', 'text/csv');
  res.attachment('orders.csv');
  res.send('id,date,status,physiotherapist,total_value\n1,2024-09-17,PROCESSING,"Dr. Smith",150.00');
};
