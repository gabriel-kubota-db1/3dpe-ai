import Joi from 'joi';

// Custom boolean conversion to handle string/number inputs
const booleanSchema = Joi.alternatives().try(
  Joi.boolean(),
  Joi.string().valid('true', 'false').custom((value) => value === 'true'),
  Joi.number().valid(0, 1).custom((value) => value === 1)
);

export const coatingSchema = Joi.object({
  description: Joi.string().min(3).required(),
  active: booleanSchema.required(),
});

export const coatingUpdateSchema = Joi.object({
  description: Joi.string().min(3).optional(),
  active: booleanSchema.optional(),
}).min(1); // At least one field must be provided for update
