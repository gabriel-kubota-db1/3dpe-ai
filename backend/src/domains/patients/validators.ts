import Joi from 'joi';

export const patientSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().allow('').optional(),
  cpf: Joi.string().allow('').optional(),
  rg: Joi.string().allow('').optional(),
  date_of_birth: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null).optional(),
  responsible_name: Joi.string().allow('').optional(),
  responsible_cpf: Joi.string().allow('').optional(),
});
