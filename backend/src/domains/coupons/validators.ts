import Joi from 'joi';

// Custom boolean conversion to handle string/number inputs
const booleanSchema = Joi.alternatives().try(
  Joi.boolean(),
  Joi.string().valid('true', 'false').custom((value) => value === 'true'),
  Joi.number().valid(0, 1).custom((value) => value === 1)
);

export const couponSchema = Joi.object({
  code: Joi.string().uppercase().alphanum().min(3).required(),
  value: Joi.number().min(0).max(100).required(),
  start_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  finish_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  active: booleanSchema.required(),
});

export const couponUpdateSchema = Joi.object({
  code: Joi.string().uppercase().alphanum().min(3).optional(),
  value: Joi.number().min(0).max(100).optional(),
  start_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  finish_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  active: booleanSchema.optional(),
}).min(1).unknown(true);
