import Joi from 'joi';

export const insoleModelSchema = Joi.object({
  description: Joi.string().min(3).required(),
  active: Joi.boolean().required(),
});
