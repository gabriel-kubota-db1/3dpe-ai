import Joi from 'joi';

const palmilhogramSchema = {
  cic_left: Joi.number().optional().allow(null),
  cic_right: Joi.number().optional().allow(null),
  cavr_left: Joi.number().optional().allow(null),
  cavr_right: Joi.number().optional().allow(null),
  cavr_total_left: Joi.number().optional().allow(null),
  cavr_total_right: Joi.number().optional().allow(null),
  cavr_prolonged_left: Joi.number().optional().allow(null),
  cavr_prolonged_right: Joi.number().optional().allow(null),
  cavl_total_left: Joi.number().optional().allow(null),
  cavl_total_right: Joi.number().optional().allow(null),
  cavl_left: Joi.number().optional().allow(null),
  cavl_right: Joi.number().optional().allow(null),
  cavl_prolonged_left: Joi.number().optional().allow(null),
  cavl_prolonged_right: Joi.number().optional().allow(null),
  brc_left: Joi.number().optional().allow(null),
  brc_right: Joi.number().optional().allow(null),
  boton_left: Joi.number().optional().allow(null),
  boton_right: Joi.number().optional().allow(null),
  bic_left: Joi.number().optional().allow(null),
  bic_right: Joi.number().optional().allow(null),
  longitudinal_arch_left: Joi.number().optional().allow(null),
  longitudinal_arch_right: Joi.number().optional().allow(null),
};

export const createPrescriptionSchema = Joi.object({
  patient_id: Joi.number().integer().required(),
  insole_model_id: Joi.number().integer().required(),
  shoe_size: Joi.string().required(),
  status: Joi.string().valid('draft', 'active', 'canceled', 'completed').required(),
  observation: Joi.string().allow('').optional(),
  ...palmilhogramSchema,
});

export const updatePrescriptionSchema = Joi.object({
  patient_id: Joi.number().integer(),
  insole_model_id: Joi.number().integer(),
  shoe_size: Joi.string(),
  status: Joi.string().valid('draft', 'active', 'canceled', 'completed'),
  observation: Joi.string().allow('').optional(),
  ...palmilhogramSchema,
});
