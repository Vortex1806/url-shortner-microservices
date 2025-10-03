import jwt from "jsonwebtoken";
import { userTokenSchema } from "../validations/token.validation.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function createUserToken(payload) {
  const validatedTokenPayload = await userTokenSchema.safeParseAsync(payload);
  if (validatedTokenPayload.error) {
    throw new Error(validatedTokenPayload.error.message);
  }
  return jwt.sign(validatedTokenPayload.data, JWT_SECRET);
}

export function validateToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}
