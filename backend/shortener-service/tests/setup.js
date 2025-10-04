import db from "../src/db/index.js";
import { usersTable, urlsTable } from "../src/models/index.js";
import { afterAll, afterEach } from "@jest/globals";
import { pool } from "../src/db/index.js";

afterAll(async () => {
  await pool.end();
});

beforeEach(async () => {
  await db.delete(urlsTable);
  await db.delete(usersTable);
});
