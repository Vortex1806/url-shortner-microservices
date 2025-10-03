import { z } from "zod";

export const signupRequestBodySchema = z.object({
  firstName: z.string(),
  lastName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginRequestBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const shortenCodeBodySchema = z.object({
  url: z.string().url(),
  code: z.string().optional(),
});
