import { Request, Response } from 'express';
import { InsoleModel } from './model';

export const getAllInsoleModels = async (req: Request, res: Response) => {
  try {
    const { model_type, active, description } = req.query;
    const query = InsoleModel.query().withGraphFetched('[evaCoating, fabricCoating]');

    if (model_type && typeof model_type === 'string' && model_type !== 'ALL') {
      query.where('model_type', model_type);
    }

    if (active && typeof active === 'string' && active !== 'ALL') {
      query.where('active', active === 'true');
    }

    if (description && typeof description === 'string') {
      query.where('description', 'like', `%${description}%`);
    }

    const models = await query.orderBy('description');
    res.json(models);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching insole models', error: error.message });
  }
};

export const createInsoleModel = async (req: Request, res: Response) => {
  try {
    const model = await InsoleModel.query().insert(req.body);
    res.status(201).json(model);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating insole model', error: error.message });
  }
};

export const updateInsoleModel = async (req: Request, res: Response) => {
  try {
    const model = await InsoleModel.query().patchAndFetchById(req.params.id, req.body);
    if (model) {
      res.json(model);
    } else {
      res.status(404).json({ message: 'Insole model not found' });
    }
  } catch (error: any) {
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
