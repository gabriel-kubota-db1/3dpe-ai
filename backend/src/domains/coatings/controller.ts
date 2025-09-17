import { Request, Response } from 'express';
import { Coating } from './model';

export const getAllCoatings = async (req: Request, res: Response) => {
  try {
    const coatings = await Coating.query();
    res.json(coatings);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching coatings', error: error.message });
  }
};

export const createCoating = async (req: Request, res: Response) => {
  try {
    const coating = await Coating.query().insert(req.body);
    res.status(201).json(coating);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating coating', error: error.message });
  }
};

export const updateCoating = async (req: Request, res: Response) => {
  try {
    const coating = await Coating.query().patchAndFetchById(req.params.id, req.body);
    if (coating) {
      res.json(coating);
    } else {
      res.status(404).json({ message: 'Coating not found' });
    }
  } catch (error: any) {
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
