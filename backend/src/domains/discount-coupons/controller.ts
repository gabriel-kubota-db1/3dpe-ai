import { Request, Response } from 'express';
import { DiscountCoupon } from './model';

export const getAllDiscountCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await DiscountCoupon.query();
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
};

export const createDiscountCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await DiscountCoupon.query().insert(req.body);
    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
};

export const updateDiscountCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await DiscountCoupon.query().patchAndFetchById(req.params.id, req.body);
    if (coupon) {
      res.json(coupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating coupon', error: error.message });
  }
};

export const deleteDiscountCoupon = async (req: Request, res: Response) => {
  try {
    const numDeleted = await DiscountCoupon.query().deleteById(req.params.id);
    if (numDeleted > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting coupon', error: error.message });
  }
};
