import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../src/app.js";
import db from "../../src/db/index.js";
import { usersTable } from "../../src/models/index.js";

describe("POST /api/users/signup", () => {
  it("should create a new user, hash the password, and return 201", async () => {
    // ARRANGE: Define the user data for the request body.
    const userData = {
      firstName: "Test",
      lastName: "User",
      email: "test.user@example.com",
      password: "password123!",
    };

    // ACT: Send a request to the API endpoint using supertest.
    const response = await request(app)
      .post("/api/users/signup")
      .send(userData);

    // ASSERT: Verify the HTTP response.
    expect(response.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty("userId");

    // ASSERT: Verify the side effect in the database.
    const userId = response.body.data.userId;
    const [userInDb] = await db.select().from(usersTable).where({ id: userId });

    expect(userInDb).toBeDefined();
    expect(userInDb.email).toBe(userData.email);
    expect(userInDb.password).not.toBe(userData.password); // CRITICAL: Ensure password was hashed
    expect(userInDb.salt).toBeDefined();
  });
});
