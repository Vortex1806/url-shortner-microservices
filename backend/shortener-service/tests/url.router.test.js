import request from "supertest";
import express from "express";
import urlRouter from "../routes/url.router.js";
import {
  createNewShortUrl,
  deleteShortUrl,
  getAllUserCodes,
} from "../services/url.service.js";
import {
  authenticationMiddleware,
  ensureAuthenticated,
} from "../middlewares/auth.middleware.js";
import { jest } from "@jest/globals";
import { createNewUser, getUserByEmail } from "../services/user.service.js";
import { hashedPasswordWithSalt } from "../utils/hash.js";
import { createUserToken } from "../utils/token.js";

const app = express();
app.use(express.json());
app.use("/api/urls", urlRouter);

beforeEach(() => {
  jest.clearAllMocks();
  getUserByEmail.mockResolvedValue(null); // means user does NOT exist
  createNewUser.mockResolvedValue({
    id: "user123",
    email: "ironman@stark.com",
  });
  hashedPasswordWithSalt.mockResolvedValue({ hash: "hashed", salt: "salt" });
  createUserToken.mockReturnValue("fake-jwt-token");
});

authenticationMiddleware.mockImplementation((req, res, next) => {
  req.user = { id: "user123" };
  next();
});
ensureAuthenticated.mockImplementation((req, res, next) => next());

describe("URL Router", () => {
  beforeEach(() => jest.clearAllMocks());

  test("POST /api/urls/shorten - success", async () => {
    createNewShortUrl.mockResolvedValue({
      id: "url123",
      shortCode: "abcd12",
      targetUrl: "https://example.com",
    });

    const res = await request(app)
      .post("/api/urls/shorten")
      .send({ url: "https://example.com" });

    expect(res.status).toBe(201);
    expect(res.body.shortCode).toBeDefined();
  });

  test("GET /api/urls/codes - returns user codes", async () => {
    getAllUserCodes.mockResolvedValue([{ id: 1, shortCode: "abc123" }]);

    const res = await request(app).get("/api/urls/codes");

    expect(res.status).toBe(200);
    expect(res.body.codes.length).toBe(1);
  });

  test("DELETE /api/urls/:id - success", async () => {
    deleteShortUrl.mockResolvedValue(true);

    const res = await request(app).delete("/api/urls/url123");

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
