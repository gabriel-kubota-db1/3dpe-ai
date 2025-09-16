import { Model, Pojo, RelationMappings, RelationMappingsThunk } from 'objection';
import bcrypt from 'bcryptjs';
import { Physiotherapist } from '../physiotherapists/model';
import { Industry } from '../industries/model';

export class User extends Model {
  id!: number;
  name!: string;
  document!: string;
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
  reset_password_token?: string;
  reset_password_expires?: Date;
  created_at!: string;
  updated_at!: string;

  // Optional relations
  physiotherapist?: Physiotherapist;
  industry?: Industry;

  static get tableName() {
    return 'users';
  }

  static relationMappings: RelationMappings | RelationMappingsThunk = {
    physiotherapist: {
      relation: Model.HasOneRelation,
      modelClass: Physiotherapist,
      join: {
        from: 'users.id',
        to: 'physiotherapists.user_id',
      },
    },
    industry: {
      relation: Model.HasOneRelation,
      modelClass: Industry,
      join: {
        from: 'users.id',
        to: 'industries.user_id',
      },
    },
  };

  async $beforeInsert() {
    if (this.password_hash) {
      this.password_hash = await bcrypt.hash(this.password_hash, 10);
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
