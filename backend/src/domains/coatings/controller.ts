import { Request, Response } from 'express';
import { Coating } from './model';
import { coatingSchema, coatingUpdateSchema } from './validators';

export const getAllCoatings = async (req: Request, res: Response) => {
  try {
    const { coating_type } = req.query;
    const query = Coating.query();

    if (coating_type && typeof coating_type === 'string') {
      query.where('coating_type', coating_type);
    }

    const coatings = await query.orderBy('description');
    res.json(coatings);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching coatings', error: error.message });
  }
};

export const createCoating = async (req: Request, res: Response) => {
  try {
    const validatedData = await coatingSchema.validateAsync(req.body);
    const coating = await Coating.query().insert(validatedData);
    res.status(201).json(coating);
  } catch (error: any) => {
    if (error.isJoi) {
      return res.status(400).json({ message: 'Validation error', details: error.details });
    }
    res.status(500).json({ message: 'Error creating coating', error: error.message });
  }
};

export const updateCoating = async (req: Request, res: Response) => {
  try {
    const { id, created_at, updated_at, ...updateData } = req.body;
    const validatedData = await coatingUpdateSchema.validateAsync(updateData);
    
    const coating = await Coating.query().patchAndFetchById(req.params.id, validatedData);
    if (coating) {
      res.json(coating);
    } else {
      res.status(4404).json({ message: 'Coating not found' });
    }
  } catch (error: any) {
    if (error.isJoi) {
      return res.status(400).json({ message: 'Validation error', details: error.details });
    }
    res.status(500).json({ message: 'Error updating coating', error: error.message });
  }
};

export const deleteCoating = async (req: Request, res: Response) => {
  try {
    const numDeleted = await Coating.query().deleteById(req.params.id);
    if (numDeleted > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Coating not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting coating', error: error.message });
  }
};
