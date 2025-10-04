import jwt from "jsonwebtoken";
import { userTokenSchema } from "../validations/token.validation.js";

export async function createUserToken(payload) {
  const validatedTokenPayload = await userTokenSchema.safeParseAsync(payload);
  if (validatedTokenPayload.error) {
    throw new Error(validatedTokenPayload.error.message);
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in the environment!");
  }
  return jwt.sign(validatedTokenPayload.data, secret);
}

export function validateToken(token) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in the environment!");
    }
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (err) {
    return null;
  }
}
