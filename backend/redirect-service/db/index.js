import "dotenv/config";
import pkg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export default db;
