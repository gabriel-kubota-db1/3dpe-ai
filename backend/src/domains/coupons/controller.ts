import { Request, Response } from 'express';
import { Coupon } from './model';

export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.query();
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
