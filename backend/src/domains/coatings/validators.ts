import Joi from 'joi';

const booleanSchema = Joi.alternatives().try(
  Joi.boolean(),
  Joi.string().valid('true', 'false').custom((value) => value === 'true'),
  Joi.number().valid(0, 1).custom((value) => value === 1)
);

export const coatingSchema = Joi.object({
  description: Joi.string().required(),
  coating_type: Joi.string().valid('EVA', 'Fabric').required(),
  number_range: Joi.string().required(),
  cost_value: Joi.number().positive().required(),
  sell_value: Joi.number().positive().required(),
  weight: Joi.number().integer().positive().required(),
  type: Joi.string().valid('INSOLE', 'SLIPPER', 'ELEMENT').required(),
  active: booleanSchema.default(true),
});

export const coatingUpdateSchema = Joi.object({
  description: Joi.string().optional(),
  coating_type: Joi.string().valid('EVA', 'Fabric').optional(),
  number_range: Joi.string().optional(),
  cost_value: Joi.number().positive().optional(),
  sell_value: Joi.number().positive().optional(),
  weight: Joi.number().integer().positive().optional(),
  type: Joi.string().valid('INSOLE', 'SLIPPER', 'ELEMENT').optional(),
  active: booleanSchema.optional(),
}).min(1).unknown(true);
