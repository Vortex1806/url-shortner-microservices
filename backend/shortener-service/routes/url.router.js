import express from "express";
import { nanoid } from "nanoid";
import {
  authenticationMiddleware,
  ensureAuthenticated,
} from "../middlewares/auth.middleware.js";
import { shortenCodeBodySchema } from "../validations/req.validation.js";

import {
  createNewShortUrl,
  deleteShortUrl,
  getAllUserCodes,
} from "../services/url.service.js";

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

export default urlRouter;
