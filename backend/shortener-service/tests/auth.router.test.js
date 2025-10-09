import request from "supertest";
import express from "express";
import authRouter from "../routes/auth.router.js";
import { createNewUser, getUserByEmail } from "../services/user.service.js";
import { hashedPasswordWithSalt } from "../utils/hash.js";
import { createUserToken } from "../utils/token.js";
import { jest } from "@jest/globals";

const app = express();
app.use(express.json());
app.use("/api/users", authRouter);

beforeEach(() => {
  jest.clearAllMocks();

  getUserByEmail.mockResolvedValue(null);
  createNewUser.mockResolvedValue({
    id: "user123",
    email: "ironman@stark.com",
  });
  hashedPasswordWithSalt.mockReturnValue({
    salt: "randomsalt",
    password: "hashedpass",
  });
  createUserToken.mockResolvedValue("fake-jwt-token");
});

describe("Auth Router", () => {
  test("POST /signup - success", async () => {
    const res = await request(app).post("/api/users/signup").send({
      firstName: "Tony",
      lastName: "Stark",
      email: "ironman@stark.com",
      password: "ironmanArcReactor",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe("user123");
    expect(createNewUser).toHaveBeenCalled();
  });

  test("POST /signup - existing user", async () => {
    getUserByEmail.mockResolvedValue({ id: "existingUser" });

    const res = await request(app).post("/api/users/signup").send({
      firstName: "Tony",
      lastName: "Stark",
      email: "ironman@stark.com",
      password: "ironmanArcReactor",
    });

    expect(res.status).toBe(400);
    expect(res.body.err).toContain("already exists");
  });

  test("POST /login - success", async () => {
    getUserByEmail.mockResolvedValue({
      id: "user123",
      email: "ironman@stark.com",
      salt: "randomsalt",
      password: "hashedpass",
    });

    hashedPasswordWithSalt.mockReturnValue({ password: "hashedpass" });
    createUserToken.mockResolvedValue("fake-jwt-token");

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "ironman@stark.com", password: "ironmanArcReactor" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe("fake-jwt-token");
  });

  test("POST /login - invalid password", async () => {
    getUserByEmail.mockResolvedValue({
      id: "user123",
      email: "ironman@stark.com",
      salt: "randomsalt",
      password: "hashedpass",
    });

    hashedPasswordWithSalt.mockReturnValue({ password: "wrongpass" });

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "ironman@stark.com", password: "wrong123" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Password is invalid");
  });
});
