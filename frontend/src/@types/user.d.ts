export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'physiotherapist' | 'industry' | 'patient';
  active: boolean;
  document: string;
  date_of_birth?: string;
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

export type UserProfile = Omit<User, 'active' | 'created_at' | 'updated_at'>;

export type UserListItem = Pick<User, 'id' | 'name' | 'email' | 'role' | 'active'>;
