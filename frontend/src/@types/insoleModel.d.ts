import { Coating } from './coating';

export type ProductType = 'INSOLE' | 'SLIPPER' | 'ELEMENT';

export interface InsoleModel {
  id: number;
  description: string;
  coating_id: number | null;
  number_range: string;
  cost_value: number;
  sell_value: number;
  weight: number;
  type: ProductType;
  active: boolean;
  created_at: string;
  updated_at: string;
  coating?: Coating;
}
