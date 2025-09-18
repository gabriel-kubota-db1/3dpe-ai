import type { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Check if the admin user already exists
  const adminUser = await knex('users').where({ email: 'admin@3dpe.com' }).first();

  if (!adminUser) {
    // Hash the password
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    // Inserts seed entries
    await knex('users').insert([
      {
        name: 'Admin User',
        document: '000.000.000-00',
        active: true,
        role: 'admin',
        email: 'admin@3dpe.com',
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  }
}
