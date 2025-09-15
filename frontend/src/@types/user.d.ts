export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'physiotherapist' | 'industry' | 'patient';
  active: boolean;
  document?: string;
  phone?: string;
  address?: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export type UserProfile = Omit<User, 'active'>;

export type UserListItem = Pick<User, 'id' | 'name' | 'email' | 'role' | 'active'>;
