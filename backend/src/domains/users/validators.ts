import Joi from 'joi';

const baseUserFields = {
  name: Joi.string().min(3).required(),
  document: Joi.string().min(11).max(18).required(),
  email: Joi.string().email().required(),
  active: Joi.boolean().optional(),
  date_of_birth: Joi.date().iso().optional(),
  phone: Joi.string().min(10).optional(),
  cep: Joi.string().length(8).optional(),
  state: Joi.string().length(2).optional(),
  city: Joi.string().optional(),
  street: Joi.string().optional(),
  number: Joi.string().optional(),
  complement: Joi.string().allow('').optional(),
};

export const physiotherapistRegisterSchema = Joi.object({
  ...baseUserFields,
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('physiotherapist').required(),
});

export const industryRegisterSchema = Joi.object({
  ...baseUserFields,
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('industry').required(),
});

export const userUpdateSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).allow('').optional(),
  active: Joi.boolean().optional(),
  date_of_birth: Joi.date().iso().optional(),
  phone: Joi.string().min(10).optional(),
  cep: Joi.string().length(8).optional(),
  state: Joi.string().length(2).optional(),
  city: Joi.string().optional(),
  street: Joi.string().optional(),
  number: Joi.string().optional(),
  complement: Joi.string().allow('').optional(),
  // Physiotherapist specific fields (optional on update)
  council_acronym: Joi.string().optional(),
  council_number: Joi.string().optional(),
  council_uf: Joi.string().length(2).optional(),
  loyalty_discount: Joi.number().min(0).optional(),
}).min(1).options({ stripUnknown: true });


export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
