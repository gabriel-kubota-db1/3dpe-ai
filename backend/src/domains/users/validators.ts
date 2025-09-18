import Joi from 'joi';

export const userUpdateSchema = Joi.object({
  name: Joi.string().min(3),
  email: Joi.string().email(),
  active: Joi.boolean(),
  date_of_birth: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null),
  phone: Joi.string().min(10),
  cep: Joi.string().length(8),
  state: Joi.string().length(2),
  city: Joi.string(),
  street: Joi.string(),
  number: Joi.string(),
  complement: Joi.string().allow('').optional(),
}).min(1).unknown(true); // Allow unknown fields and strip them

const baseUserSchema = {
  name: Joi.string().min(3).required(),
  document: Joi.string().min(11).max(18).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  date_of_birth: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null),
  phone: Joi.string().min(10),
  cep: Joi.string().length(8),
  state: Joi.string().length(2),
  city: Joi.string(),
  street: Joi.string(),
  number: Joi.string(),
  complement: Joi.string().allow('').optional(),
};

export const physiotherapistRegisterSchema = Joi.object({
  ...baseUserSchema,
});

export const industryRegisterSchema = Joi.object({
  ...baseUserSchema,
});


export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const logoutSchema = Joi.object({
  refreshToken: Joi.string().optional(),
});
