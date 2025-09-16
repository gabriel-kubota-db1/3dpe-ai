import { Request, Response } from 'express';
import { InsoleModel } from './model';
import { insoleModelSchema, insoleModelUpdateSchema } from './validators';

export const getAllInsoleModels = async (req: Request, res: Response) => {
  try {
    const insoleModels = await InsoleModel.query()
      .withGraphFetched('coating')
      .orderBy('description', 'ASC');
    res.json(insoleModels);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching insole models', error: error.message });
  }
};

export const createInsoleModel = async (req: Request, res: Response) => {
  try {
    const validatedData = await insoleModelSchema.validateAsync(req.body);
    const insoleModel = await InsoleModel.query().insert(validatedData);
    res.status(201).json(insoleModel);
  } catch (error: any) {
    if (error.isJoi) {
      return res.status(400).json({ message: 'Validation error', details: error.details });
    }
    res.status(500).json({ message: 'Error creating insole model', error: error.message });
  }
};

export const updateInsoleModel = async (req: Request, res: Response) => {
  try {
    const validatedData = await insoleModelUpdateSchema.validateAsync(req.body);
    
    const insoleModel = await InsoleModel.query().patchAndFetchById(req.params.id, validatedData);

    if (insoleModel) {
      res.json(insoleModel);
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
