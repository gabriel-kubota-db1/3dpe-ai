import Joi from 'joi';

const palmilhogramSchema = Joi.object({
    id: Joi.number().optional(),
    // Left Foot
    cic_left: Joi.number().optional().allow(null),
    cavr_left: Joi.number().optional().allow(null),
    cavr_total_left: Joi.number().optional().allow(null),
    cavr_prolonged_left: Joi.number().optional().allow(null),
    cavl_left: Joi.number().optional().allow(null),
    cavl_total_left: Joi.number().optional().allow(null),
    cavl_prolonged_left: Joi.number().optional().allow(null),
    brc_left: Joi.number().optional().allow(null),
    boton_left: Joi.number().optional().allow(null),
    bic_left: Joi.number().optional().allow(null),
    longitudinal_arch_left: Joi.number().optional().allow(null),

    // Right Foot
    cic_right: Joi.number().optional().allow(null),
    cavr_right: Joi.number().optional().allow(null),
    cavr_total_right: Joi.number().optional().allow(null),
    cavr_prolonged_right: Joi.number().optional().allow(null),
    cavl_right: Joi.number().optional().allow(null),
    cavl_total_right: Joi.number().optional().allow(null),
    cavl_prolonged_right: Joi.number().optional().allow(null),
    brc_right: Joi.number().optional().allow(null),
    boton_right: Joi.number().optional().allow(null),
    bic_right: Joi.number().optional().allow(null),
    longitudinal_arch_right: Joi.number().optional().allow(null),
}).unknown(true);

export const prescriptionSchema = Joi.object({
    patient_id: Joi.number().integer().required(),
    insole_model_id: Joi.number().integer().required(),
    numeration: Joi.string().required(),
    status: Joi.string().valid('DRAFT', 'ACTIVE', 'CANCELED', 'COMPLETED').required(),
    observations: Joi.string().allow('').optional(),
    palmilhogram: palmilhogramSchema.required(),
});
