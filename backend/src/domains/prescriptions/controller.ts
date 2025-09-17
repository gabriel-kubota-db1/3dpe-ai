import { Request, Response } from 'express';
import Prescription from './model';

export const createPrescription = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const physiotherapist_id = req.user.id;
    const prescription = await Prescription.query().insert({
      ...req.body,
      physiotherapist_id,
    });
    res.status(201).json(prescription);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating prescription', error: error.message });
  }
};

export const getAllPrescriptions = async (req: Request, res: Response) => {
  try {
    const prescriptions = await Prescription.query()
      .withGraphFetched('[patient(selectName), physiotherapist(selectName), insoleModel(selectName)]')
      .modifiers({
        selectName(builder) {
          builder.select('name');
        }
      });
    res.json(prescriptions);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
};

export const getPrescriptionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.query().findById(id).withGraphFetched('[patient, physiotherapist, insoleModel]');
    if (prescription) {
      res.json(prescription);
    } else {
      res.status(404).json({ message: 'Prescription not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching prescription', error: error.message });
  }
};

export const updatePrescription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.query().patchAndFetchById(id, req.body);
    if (prescription) {
      res.json(prescription);
    } else {
      res.status(404).json({ message: 'Prescription not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating prescription', error: error.message });
  }
};

export const deletePrescription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Prescription.query().deleteById(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Prescription not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting prescription', error: error.message });
  }
};
