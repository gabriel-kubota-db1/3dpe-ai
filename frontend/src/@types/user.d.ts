export interface User {
  id: number;
  name: string;
  cpf: string;
  active: boolean;
  date_of_birth?: string;
  role: 'admin' | 'physiotherapist' | 'patient' | 'industry';
  email: string;
  phone?: string;
  cep?: string;
  state?: string;
  city?: string;
  street?: string;
  number?: string;
  complement?: string;
  created_at: string;
  updated_at: string;
}
