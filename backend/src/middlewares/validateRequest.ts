import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

interface ValidationSchemas {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validations = [
      { key: 'body', schema: schemas.body, data: req.body },
      { key: 'query', schema: schemas.query, data: req.query },
      { key: 'params', schema: schemas.params, data: req.params },
    ];

    for (const v of validations) {
      if (v.schema) {
        const { error, value } = v.schema.validate(v.data, { 
          abortEarly: false, 
          convert: true, // Enable type conversion
          stripUnknown: true // Strip unknown fields
        });
        if (error) {
          const errors = error.details.map((detail) => detail.message);
          return res.status(400).json({ message: 'Validation error', errors });
        }
        
        // Update the request with the converted values
        if (v.key === 'body') req.body = value;
        else if (v.key === 'query') req.query = value;
        else if (v.key === 'params') req.params = value;
      }
    }

    next();
  };
};
