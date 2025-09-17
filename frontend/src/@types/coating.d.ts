export type CoatingType = 'EVA' | 'Fabric';

export interface Coating {
  id: number;
  description: string;
  coating_type: CoatingType;
  active: boolean;
}
