import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { userTable } from "../models/user.model.js";

export async function getUserByEmail(email) {
  const [existingUser] = await db
    .select({
      id: userTable.id,
      firstName: userTable.firstName,
      lastName: userTable.firstName,
      email: userTable.lastName,
      salt: userTable.salt,
      password: userTable.password,
    })
    .from(userTable)
    .where(eq(userTable.email, email));
  return existingUser;
}

export async function createNewUser(
  firstName,
  lastName,
  email,
  password,
  salt
) {
  const [user] = await db
    .insert(userTable)
    .values({
      firstName,
      lastName,
      email,
      password,
      salt,
    })
    .returning({ id: userTable.id });
  return user;
}
