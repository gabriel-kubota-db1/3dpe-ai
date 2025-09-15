import { Model, Pojo } from 'objection';
import bcrypt from 'bcryptjs';

export class User extends Model {
  id!: number;
  name!: string;
  cpf!: string;
  active!: boolean;
  date_of_birth?: string;
  role!: 'admin' | 'physiotherapist' | 'patient' | 'industry';
  email!: string;
  phone?: string;
  cep?: string;
  state?: string;
  city?: string;
  street?: string;
  number?: string;
  complement?: string;
  password_hash!: string;
  created_at!: string;
  updated_at!: string;

  static get tableName() {
    return 'users';
  }

  async $beforeInsert() {
    if (this.password_hash) {
      this.password_hash = await bcrypt.hash(this.password_hash, 10);
    }
  }

  async $beforeUpdate() {
    if (this.password_hash) {
      const userInDb = await User.query().findById(this.id);
      if (userInDb && userInDb.password_hash !== this.password_hash) {
        this.password_hash = await bcrypt.hash(this.password_hash, 10);
      }
    }
  }

  verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }

  $formatJson(json: Pojo): Pojo {
    json = super.$formatJson(json);
    delete json.password_hash;
    return json;
  }
}
