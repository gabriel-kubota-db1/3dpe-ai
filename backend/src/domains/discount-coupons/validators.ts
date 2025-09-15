import Joi from 'joi';

export const discountCouponSchema = Joi.object({
  code: Joi.string().uppercase().min(3).required(),
  percentage: Joi.number().min(0).max(100).required(),
  active: Joi.boolean().required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().greater(Joi.ref('start_date')).required(),
});
