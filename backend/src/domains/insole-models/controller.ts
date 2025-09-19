import { Request, Response } from 'express';
import { InsoleModel } from './model';
import { insoleModelSchema, insoleModelUpdateSchema } from './validators';

export const getAllInsoleModels = async (req: Request, res: Response) => {
  try {
    const { coating_type, active, description } = req.query;
    const query = InsoleModel.query().withGraphFetched('coating');

    if (coating_type && typeof coating_type === 'string' && coating_type !== 'ALL') {
      query.joinRelated('coating').where('coating.coating_type', coating_type);
    }

    if (active && typeof active === 'string' && active !== 'ALL') {
      query.where('insole_models.active', active === 'true');
    }

    if (description && typeof description === 'string' && description.trim() !== '') {
      query.where('insole_models.description', 'like', `%${description}%`);
    }

    const models = await query.orderBy('insole_models.description');
    res.json(models);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching insole models', error: error.message });
  }
};

export const createInsoleModel = async (req: Request, res: Response) => {
  try {
    const validatedData = await insoleModelSchema.validateAsync(req.body);
    const model = await InsoleModel.query().insert(validatedData);
    res.status(201).json(model);
  } catch (error: any) {
    if (error.isJoi) {
      return res.status(400).json({ message: 'Validation error', details: error.details });
    }
    res.status(500).json({ message: 'Error creating insole model', error: error.message });
  }
};

export const updateInsoleModel = async (req: Request, res: Response) => {
  try {
    const { id, created_at, updated_at, coating, ...updateData } = req.body;
    const validatedData = await insoleModelUpdateSchema.validateAsync(updateData);
    
    const model = await InsoleModel.query().patchAndFetchById(req.params.id, validatedData);
    if (model) {
      const modelWithCoating = await model.$fetchGraph('coating');
      res.json(modelWithCoating);
    } else {
      res.status(404).json({ message: 'Insole model not found' });
    }
  } catch (error: any) {
    if (error.isJoi) {
      return res.status(400).json({ message: 'Validation error', details: error.details });
    }
    res.status(500).json({ message: 'Error updating insole model', error: error.message });
  }
};

export const deleteInsoleModel = async (req: Request, res: Response) => {
  try {
    const numDeleted = await InsoleModel.query().deleteById(req.params.id);
    if (numDeleted > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Insole model not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting insole model', error: error.message });
  }
};
