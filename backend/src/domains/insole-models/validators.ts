import Joi from 'joi';

export const insoleModelSchema = Joi.object({
  description: Joi.string().min(3).required(),
  type: Joi.string().required(),
  numeration: Joi.string().required(),
  coating_type: Joi.string().valid('eva', 'fabric').required(),
  eva_coating_id: Joi.number().integer().allow(null),
  fabric_coating_id: Joi.number().integer().allow(null),
  cost_value: Joi.number().positive().required(),
  sale_value: Joi.number().positive().required(),
});
