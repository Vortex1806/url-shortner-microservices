import express from "express";
import { nanoid } from "nanoid";
import {
  authenticationMiddleware,
  ensureAuthenticated,
} from "./middlewares/auth.middleware.js";
import {
  signupRequestBodySchema,
  loginRequestBodySchema,
  shortenCodeBodySchema,
} from "./validations/req.validation.js";
import { createNewUser, getUserByEmail } from "./services/user.service.js";
import { hashedPasswordWithSalt } from "./utils/hash.js";
import {
  createNewShortUrl,
  deleteShortUrl,
  getAllUserCodes,
} from "./services/url.service.js";
import { createUserToken } from "./utils/token.js";

const app = express();
app.use(express.json());
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

app.use("/api/users", authRouter);

const urlRouter = express.Router();

urlRouter.post(
  "/shorten",
  authenticationMiddleware,
  ensureAuthenticated,
  async (req, res) => {
    const validationResult = await shortenCodeBodySchema.safeParseAsync(
      req.body
    );
    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error.message });
    }
    const { url, code } = validationResult.data;
    const shortCode = code ?? nanoid(6);
    const result = await createNewShortUrl(shortCode, url, req.user.id);

    return res.status(201).json({
      id: result.id,
      shortCode: result.shortCode,
      targetUrl: result.targetUrl,
    });
  }
);

urlRouter.get(
  "/codes",
  authenticationMiddleware,
  ensureAuthenticated,
  async (req, res) => {
    const codes = await getAllUserCodes(req.user.id);
    return res.json({ codes });
  }
);

urlRouter.delete(
  "/:id",
  authenticationMiddleware,
  ensureAuthenticated,
  async (req, res) => {
    await deleteShortUrl(req.params.id, req.user.id);
    return res.status(200).json({ deleted: true });
  }
);

app.use("/api/urls", urlRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Shortener service listening on port ${PORT}`);
});
