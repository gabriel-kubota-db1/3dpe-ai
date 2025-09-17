import { Request, Response } from 'express';
import { InsolePrescription } from './model';
import { Palmilogram } from './palmilogramModel';
import { transaction } from 'objection';

// Get all prescriptions for the logged-in physiotherapist
export const getAllPrescriptions = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const physiotherapistId = req.user.id;
    const prescriptions = await InsolePrescription.query()
      .withGraphFetched('[patient, insoleModel]')
      .whereExists(
        InsolePrescription.relatedQuery('patient').where('physiotherapist_id', physiotherapistId)
      )
      .orderBy('created_at', 'desc');
    res.json(prescriptions);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
};

// Get a single prescription by ID
export const getPrescriptionById = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const physiotherapistId = req.user.id;
    const prescription = await InsolePrescription.query()
      .findById(req.params.id)
      .withGraphFetched('[patient, insoleModel, palmilogram]')
      .whereExists(
        InsolePrescription.relatedQuery('patient').where('physiotherapist_id', physiotherapistId)
      );

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    res.json(prescription);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching prescription', error: error.message });
  }
};

// Create a new prescription
export const createPrescription = async (req: Request, res: Response) => {
  const trx = await transaction.start(InsolePrescription.knex());
  try {
    const { patient_id, insole_model_id, numeration, status, observations, palmilhogram } = req.body;

    // TODO: Verify patient belongs to the physiotherapist

    const newPalmilogram = await Palmilogram.query(trx).insert(palmilhogram);

    const prescriptionData = {
      patient_id,
      insole_model_id,
      numeration,
      status,
      observations,
      palmilhogram_id: newPalmilogram.id,
    };

    const newPrescription = await InsolePrescription.query(trx)
      .insert(prescriptionData)
      .withGraphFetched('[patient, insoleModel, palmilogram]');

    await trx.commit();
    res.status(201).json(newPrescription);
  } catch (error: any) {
    await trx.rollback();
    res.status(500).json({ message: 'Error creating prescription', error: error.message });
  }
};

// Update an existing prescription
export const updatePrescription = async (req: Request, res: Response) => {
    const trx = await transaction.start(InsolePrescription.knex());
    try {
      const { id } = req.params;
      const { patient_id, insole_model_id, numeration, status, observations, palmilhogram } = req.body;
  
      const prescription = await InsolePrescription.query(trx).findById(id);
      if (!prescription) {
        await trx.rollback();
        return res.status(404).json({ message: 'Prescription not found' });
      }
  
      // TODO: Verify patient belongs to the physiotherapist
  
      if (palmilhogram && prescription.palmilhogram_id) {
        await Palmilogram.query(trx).patch(palmilhogram).where('id', prescription.palmilhogram_id);
      }
  
      const prescriptionData = {
        patient_id,
        insole_model_id,
        numeration,
        status,
        observations,
      };
  
      const updatedPrescription = await InsolePrescription.query(trx)
        .patchAndFetchById(id, prescriptionData)
        .withGraphFetched('[patient, insoleModel, palmilogram]');
  
      await trx.commit();
      res.json(updatedPrescription);
    } catch (error: any) {
      await trx.rollback();
      res.status(500).json({ message: 'Error updating prescription', error: error.message });
    }
};
