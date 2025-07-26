
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // store your Neon URL in .env
  ssl: true, // required for Neon
});

export const db = drizzle(pool, { schema });
