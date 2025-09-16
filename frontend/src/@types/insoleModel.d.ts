import { Coating } from './coating';

export interface InsoleModel {
  id: number;
  description: string;
  coating_id: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  coating?: Coating;
}
