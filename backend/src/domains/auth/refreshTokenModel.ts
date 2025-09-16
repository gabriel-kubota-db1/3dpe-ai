import { Model, RelationMappings, RelationMappingsThunk } from 'objection';
import { User } from '../users/model.js';

export class RefreshToken extends Model {
  id!: number;
  user_id!: number;
  token!: string;
  expires_at!: Date;
  is_revoked!: boolean;
  device_info?: string;
  created_at!: string;
  updated_at!: string;

  user?: User;

  static get tableName() {
    return 'refresh_tokens';
  }

  static relationMappings: RelationMappings | RelationMappingsThunk = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'refresh_tokens.user_id',
        to: 'users.id',
      },
    },
  };

  // Check if the refresh token is expired
  isExpired(): boolean {
    return new Date() > new Date(this.expires_at);
  }

  // Check if the refresh token is valid (not revoked and not expired)
  isValid(): boolean {
    return !this.is_revoked && !this.isExpired();
  }
}
