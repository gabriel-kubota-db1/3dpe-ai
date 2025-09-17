import { Request, Response } from 'express';
import { InsoleModel } from './model';

export const getAllInsoleModels = async (req: Request, res: Response) => {
  try {
    const insoleModels = await InsoleModel.query();
    res.json(insoleModels);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching insole models', error: error.message });
  }
};

export const createInsoleModel = async (req: Request, res: Response) => {
  try {
    const insoleModel = await InsoleModel.query().insert(req.body);
    res.status(201).json(insoleModel);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating insole model', error: error.message });
  }
};

export const updateInsoleModel = async (req: Request, res: Response) => {
  try {
    const insoleModel = await InsoleModel.query().patchAndFetchById(req.params.id, req.body);
    if (insoleModel) {
      res.json(insoleModel);
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
