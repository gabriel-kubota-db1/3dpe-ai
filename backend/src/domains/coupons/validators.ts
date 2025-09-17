import Joi from 'joi';

export const couponSchema = Joi.object({
  code: Joi.string().uppercase().alphanum().min(3).required(),
  discount_type: Joi.string().valid('percentage', 'fixed').required(),
  value: Joi.number().positive().required(),
  expiry_date: Joi.date().iso().required(),
  active: Joi.boolean().required(),
});
