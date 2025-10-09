import { jest } from "@jest/globals";

jest.unstable_mockModule("../services/user.service.js", () => ({
  createNewUser: jest.fn(),
  getUserByEmail: jest.fn(),
}));
jest.unstable_mockModule("../services/url.service.js", () => ({
  createNewShortUrl: jest.fn(),
  getAllUserCodes: jest.fn(),
  deleteShortUrl: jest.fn(),
}));
jest.unstable_mockModule("../utils/hash.js", () => ({
  hashedPasswordWithSalt: jest.fn(),
}));
jest.unstable_mockModule("../utils/token.js", () => ({
  createUserToken: jest.fn(),
}));
jest.unstable_mockModule("../middlewares/auth.middleware.js", () => ({
  authenticationMiddleware: jest.fn((req, res, next) => {
    req.user = { id: "user123" };
    next();
  }),
  ensureAuthenticated: jest.fn((req, res, next) => next()),
}));
