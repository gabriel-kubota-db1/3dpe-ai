import Joi from 'joi';

export const coatingSchema = Joi.object({
  description: Joi.string().min(3).required(),
  active: Joi.boolean().required(),
});
