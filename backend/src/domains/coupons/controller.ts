import { Request, Response } from 'express';
import { Coupon } from './model';
import dayjs from 'dayjs';

export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const { active, code } = req.query;
    const query = Coupon.query();

    if (active && typeof active === 'string' && active !== 'ALL') {
      query.where('active', active === 'true');
    }

    if (code && typeof code === 'string' && code.trim() !== '') {
      query.where('code', 'like', `%${code}%`);
    }

    const coupons = await query.orderBy('code');
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.query().insert(req.body);
    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    // Remove read-only fields that shouldn't be updated
    const { id, created_at, updated_at, ...updateData } = req.body;
    
    const coupon = await Coupon.query().patchAndFetchById(req.params.id, updateData);
    if (coupon) {
      res.json(coupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating coupon', error: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const numDeleted = await Coupon.query().deleteById(req.params.id);
    if (numDeleted > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting coupon', error: error.message });
  }
};

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }

    const coupon = await Coupon.query().where('code', code).first();

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }

    if (!coupon.active) {
      return res.status(400).json({ message: 'This coupon is inactive.' });
    }

    const today = dayjs().startOf('day');
    const startDate = dayjs(coupon.start_date);
    const finishDate = dayjs(coupon.finish_date);

    if (today.isBefore(startDate) || today.isAfter(finishDate)) {
      return res.status(400).json({ message: 'This coupon is expired or not yet valid.' });
    }

    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: 'Error validating coupon', error: error.message });
  }
};
