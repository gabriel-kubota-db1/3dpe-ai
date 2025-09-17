import { Request, Response } from 'express';
import { Patient } from './model';
import { PatientAuditLog } from './auditLogModel';
import { transaction } from 'objection';

// Get all patients for the logged-in physiotherapist
export const getAllPatients = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const physiotherapistId = req.user.id;
    const { search, active } = req.query;

    const query = Patient.query().where('physiotherapist_id', physiotherapistId);

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query.where((builder) => {
        builder
          .where('name', 'like', searchTerm)
          .orWhere('email', 'like', searchTerm)
          .orWhere('cpf', 'like', searchTerm);
      });
    }

    if (active === 'true' || active === 'false') {
      query.where('active', active === 'true');
    }

    const patients = await query.orderBy('name');
    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
};

// Get a single patient by ID
export const getPatientById = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const physiotherapistId = req.user.id;
    const patient = await Patient.query()
      .findById(req.params.id)
      .where('physiotherapist_id', physiotherapistId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error: any) => {
    res.status(500).json({ message: 'Error fetching patient', error: error.message });
  }
};

// Create a new patient
export const createPatient = async (req: Request, res: Response) => {
  const trx = await transaction.start(Patient.knex());
  try {
    // @ts-ignore
    const physiotherapistId = req.user.id;
    const patientData = { ...req.body, physiotherapist_id: physiotherapistId };

    const newPatient = await Patient.query(trx).insert(patientData);

    await PatientAuditLog.query(trx).insert({
      patient_id: newPatient.id,
      // @ts-ignore
      user_id: req.user.id,
      action: 'CREATED',
      new_data: newPatient,
    });

    await trx.commit();
    res.status(201).json(newPatient);
  } catch (error: any) {
    await trx.rollback();
    res.status(500).json({ message: 'Error creating patient', error: error.message });
  }
};

// Update a patient
export const updatePatient = async (req: Request, res: Response) => {
  const trx = await transaction.start(Patient.knex());
  try {
    // @ts-ignore
    const physiotherapistId = req.user.id;
    const patientId = Number(req.params.id);

    const oldPatient = await Patient.query(trx)
      .findById(patientId)
      .where('physiotherapist_id', physiotherapistId);

    if (!oldPatient) {
      await trx.rollback();
      return res.status(404).json({ message: 'Patient not found' });
    }

    const updatedPatient = await Patient.query(trx).patchAndFetchById(patientId, req.body);

    await PatientAuditLog.query(trx).insert({
      patient_id: patientId,
      // @ts-ignore
      user_id: req.user.id,
      action: 'UPDATED',
      old_data: oldPatient,
      new_data: updatedPatient,
    });

    await trx.commit();
    res.json(updatedPatient);
  } catch (error: any) {
    await trx.rollback();
    res.status(500).json({ message: 'Error updating patient', error: error.message });
  }
};

// Get audit logs for a patient
export const getPatientAuditLogs = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const physiotherapistId = req.user.id;
        const patientId = Number(req.params.id);

        // First, verify the patient belongs to the physiotherapist
        const patient = await Patient.query()
            .findById(patientId)
            .where('physiotherapist_id', physiotherapistId);

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const logs = await PatientAuditLog.query()
            .where('patient_id', patientId)
            .withGraphFetched('user(selectName)')
            .modifiers({
                selectName(builder) {
                    builder.select('name');
                }
            })
            .orderBy('changed_at', 'desc');
            
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
    }
};
