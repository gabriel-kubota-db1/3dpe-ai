import Joi from 'joi';

export const shippingSchema = Joi.object({
  cep: Joi.string().required(),
  prescriptionIds: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

export const checkoutSchema = Joi.object({
  prescriptionIds: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
  shipping: Joi.object({
    carrier: Joi.string().required(),
    price: Joi.number().required(),
    deadline: Joi.number().integer().required(),
  }).required(),
  payment: Joi.object({
    method: Joi.string().required(),
    // In a real scenario, this would contain tokenized card info, etc.
  }).required(),
  observations: Joi.string().allow('').optional(),
});

export const statusUpdateSchema = Joi.object({
  status: Joi.string().valid('PENDING_PAYMENT', 'PROCESSING', 'IN_PRODUCTION', 'SHIPPED', 'COMPLETED', 'CANCELED').required(),
});

export const batchStatusUpdateSchema = Joi.object({
  orderIds: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
  status: Joi.string().valid('PENDING_PAYMENT', 'PROCESSING', 'IN_PRODUCTION', 'SHIPPED', 'COMPLETED', 'CANCELED').required(),
});
