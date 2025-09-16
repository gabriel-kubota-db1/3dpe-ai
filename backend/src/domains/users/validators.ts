import Joi from 'joi';

export const userCreateSchema = Joi.object({
  name: Joi.string().min(3).required(),
  document: Joi.string().min(11).max(18).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'physiotherapist', 'patient', 'industry').required(),
  active: Joi.boolean(),
  date_of_birth: Joi.date().iso(),
  phone: Joi.string().min(10),
  cep: Joi.string().length(9),
  state: Joi.string().length(2),
  city: Joi.string(),
  street: Joi.string(),
  number: Joi.string(),
  complement: Joi.string().allow('').optional(),
});

export const userUpdateSchema = Joi.object({
  name: Joi.string().min(3),
  email: Joi.string().email(),
  active: Joi.boolean(),
  date_of_birth: Joi.date().iso(),
  phone: Joi.string().min(10),
  cep: Joi.string().length(9),
  state: Joi.string().length(2),
  city: Joi.string(),
  street: Joi.string(),
  number: Joi.string(),
  complement: Joi.string().allow('').optional(),
  // Physiotherapist specific
  council_acronym: Joi.string().when('role', { is: 'physiotherapist', then: Joi.required() }),
  council_number: Joi.string().when('role', { is: 'physiotherapist', then: Joi.required() }),
  council_uf: Joi.string().length(2).when('role', { is: 'physiotherapist', then: Joi.required() }),
  loyalty_discount: Joi.number().min(0).when('role', { is: 'physiotherapist', then: Joi.optional() }),
}).min(1).unknown(true); // Allow unknown fields and strip them

const baseUserSchema = {
  name: Joi.string().min(3).required(),
  document: Joi.string().min(11).max(18).required(),
  email: Joi.string().email().required(),
  date_of_birth: Joi.date().iso(),
  phone: Joi.string().min(10),
  cep: Joi.string().length(9),
  state: Joi.string().length(2),
  city: Joi.string(),
  street: Joi.string(),
  number: Joi.string(),
  complement: Joi.string().allow('').optional(),
};

export const physiotherapistRegisterSchema = Joi.object({
  ...baseUserSchema,
  council_acronym: Joi.string().required(),
  council_number: Joi.string().required(),
  council_uf: Joi.string().length(2).required(),
  loyalty_discount: Joi.number().min(0).optional(),
});

export const industryRegisterSchema = Joi.object({
  ...baseUserSchema,
});


export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
