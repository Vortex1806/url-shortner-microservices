import express from "express";

import { createNewUser, getUserByEmail } from "../services/user.service.js";
import { hashedPasswordWithSalt } from "../utils/hash.js";
import {
  signupRequestBodySchema,
  loginRequestBodySchema,
} from "../validations/req.validation.js";
import { createUserToken } from "../utils/token.js";

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  const validationResult = await signupRequestBodySchema.safeParseAsync(
    req.body
  );
  if (validationResult.error) {
    return res.status(400).json({ error: validationResult.error.format() });
  }
  const { firstName, lastName, email, password } = validationResult.data;
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return res
      .status(400)
      .json({ err: `user with email ${email} already exists` });
  }
  const { salt, password: hashedPassword } = hashedPasswordWithSalt(password);
  const user = await createNewUser(
    firstName,
    lastName,
    email,
    hashedPassword,
    salt
  );
  return res.status(201).json({ data: { userId: user.id } });
});

authRouter.post("/login", async (req, res) => {
  const loginValidation = await loginRequestBodySchema.safeParseAsync(req.body);
  if (loginValidation.error) {
    return res.status(400).json({ error: loginValidation.error.format() });
  }
  const { email, password } = loginValidation.data;
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { password: hashedInputPassword } = hashedPasswordWithSalt(
    password,
    user.salt
  );

  if (hashedInputPassword !== user.password) {
    return res.status(400).json({ error: "Password is invalid" });
  }

  const payload = { id: user.id };
  const token = await createUserToken(payload);
  return res.json({ success: "User logged in successfully", token: token });
});

export default authRouter;
