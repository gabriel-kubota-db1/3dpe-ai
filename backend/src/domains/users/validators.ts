import Joi from 'joi';

export const updateUserProfileSchema = Joi.object({
  name: Joi.string().min(3).max(255),
  date_of_birth: Joi.date().iso(),
  email: Joi.string().email(),
  phone: Joi.string().max(20),
  cep: Joi.string().length(9), // e.g., 12345-678
  state: Joi.string().length(2),
  city: Joi.string().max(100),
  street: Joi.string().max(255),
  number: Joi.string().max(20),
  complement: Joi.string().max(100).allow('', null),
});
