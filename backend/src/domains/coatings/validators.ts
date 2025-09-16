import Joi from 'joi';

const booleanSchema = Joi.alternatives().try(
  Joi.boolean(),
  Joi.string().valid('true', 'false').custom((value) => value === 'true'),
  Joi.number().valid(0, 1).custom((value) => value === 1)
);

export const coatingSchema = Joi.object({
  description: Joi.string().required(),
  coating_type: Joi.string().valid('EVA', 'Fabric').required(),
  active: booleanSchema.default(true),
});

export const coatingUpdateSchema = Joi.object({
  description: Joi.string().optional(),
  coating_type: Joi.string().valid('EVA', 'Fabric').optional(),
  active: booleanSchema.optional(),
}).min(1).unknown(true);
