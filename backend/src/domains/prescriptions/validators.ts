import Joi from 'joi';

const palmilhogramSchema = Joi.object({
    cic_left: Joi.boolean().optional(),
    cic_left_value: Joi.number().when('cic_left', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) }),
    cavr_left: Joi.boolean().optional(),
    cavr_left_value: Joi.number().when('cavr_left', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) }),
    medial_longitudinal_arch_left: Joi.boolean().optional(),
    medial_longitudinal_arch_left_value: Joi.number().when('medial_longitudinal_arch_left', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) }),
    lateral_longitudinal_arch_left: Joi.boolean().optional(),
    lateral_longitudinal_arch_left_value: Joi.number().when('lateral_longitudinal_arch_left', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) }),
    transverse_arch_left: Joi.boolean().optional(),
    transverse_arch_left_value: Joi.number().when('transverse_arch_left', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) }),
    calcaneus_left: Joi.boolean().optional(),
    calcaneus_left_value: Joi.number().when('calcaneus_left', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) }),
    
    cic_right: Joi.boolean().optional(),
    cic_right_value: Joi.number().when('cic_right', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) }),
    cavr_right: Joi.boolean().optional(),
    cavr_right_value: Joi.number().when('cavr_right', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) }),
    medial_longitudinal_arch_right: Joi.boolean().optional(),
    medial_longitudinal_arch_right_value: Joi.number().when('medial_longitudinal_arch_right', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) }),
    lateral_longitudinal_arch_right: Joi.boolean().optional(),
    lateral_longitudinal_arch_right_value: Joi.number().when('lateral_longitudinal_arch_right', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) }),
    transverse_arch_right: Joi.boolean().optional(),
    transverse_arch_right_value: Joi.number().when('transverse_arch_right', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) }),
    calcaneus_right: Joi.boolean().optional(),
    calcaneus_right_value: Joi.number().when('calcaneus_right', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) }),

    observations: Joi.string().allow('').optional(),
});

export const prescriptionSchema = Joi.object({
    patient_id: Joi.number().integer().required(),
    insole_model_id: Joi.number().integer().required(),
    numeration: Joi.string().required(),
    palmilhogram: palmilhogramSchema.required(),
});
