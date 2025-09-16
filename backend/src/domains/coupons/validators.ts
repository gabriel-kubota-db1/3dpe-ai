import Joi from 'joi';

// Custom boolean conversion to handle string/number inputs
const booleanSchema = Joi.alternatives().try(
  Joi.boolean(),
  Joi.string().valid('true', 'false').custom((value) => value === 'true'),
  Joi.number().valid(0, 1).custom((value) => value === 1)
);

export const couponSchema = Joi.object({
  code: Joi.string().uppercase().alphanum().min(3).required(),
  discount_type: Joi.string().valid('percentage', 'fixed').required(),
  value: Joi.number().positive().required(),
  expiry_date: Joi.date().iso().required(),
  active: booleanSchema.required(),
});

export const couponUpdateSchema = Joi.object({
  code: Joi.string().uppercase().alphanum().min(3).optional(),
  discount_type: Joi.string().valid('percentage', 'fixed').optional(),
  value: Joi.number().positive().optional(),
  expiry_date: Joi.date().iso().optional(),
  active: booleanSchema.optional(),
}).min(1).unknown(true); // At least one field must be provided for update, allow unknown fields
