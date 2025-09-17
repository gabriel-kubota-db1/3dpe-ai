import Joi from 'joi';

const addressSchema = {
  cep: Joi.string().length(8).optional().allow(null, ''),
  state: Joi.string().length(2).optional().allow(null, ''),
  city: Joi.string().optional().allow(null, ''),
  street: Joi.string().optional().allow(null, ''),
  number: Joi.string().optional().allow(null, ''),
  complement: Joi.string().optional().allow(null', ''),
};

const baseUserSchema = {
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  document: Joi.string().min(11).max(14).required(),
  active: Joi.boolean(),
  date_of_birth: Joi.date().iso().optional().allow(null),
  phone: Joi.string().min(10).optional().allow(null, ''),
  ...addressSchema,
};

export const patientRegisterSchema = Joi.object({
  ...baseUserSchema,
});

export const physiotherapistRegisterSchema = Joi.object({
  ...baseUserSchema,
});

export const industryRegisterSchema = Joi.object({
  ...baseUserSchema,
});

export const userUpdateSchema = Joi.object({
  name: Joi.string().min(3),
  email: Joi.string().email(),
  active: Joi.boolean(),
  date_of_birth: Joi.date().iso().optional().allow(null),
  phone: Joi.string().min(10).optional().allow(null, ''),
  ...addressSchema,
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
