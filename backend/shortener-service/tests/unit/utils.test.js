import { describe, it, expect } from "@jest/globals";
import { hashedPasswordWithSalt } from "../../utils/hash.js"; // Adjust path as needed

describe("Utility: hashedPasswordWithSalt", () => {
  it("should return a different hash for the same password with different salts", () => {
    // ARRANGE: Define the inputs.
    const password = "mySecurePassword123";
    const salt1 = "randomSalt1";
    const salt2 = "differentRandomSalt2";

    // ACT: Call the function with different salts.
    const result1 = hashedPasswordWithSalt(password, salt1);
    const result2 = hashedPasswordWithSalt(password, salt2);

    // ASSERT: Verify the outcomes.
    expect(result1.password).not.toBe(result2.password);
    expect(result1.salt).toBe(salt1);
    expect(result2.salt).toBe(salt2);
  });

  it("should return the same hash for the same password and same salt", () => {
    // ARRANGE: Define the inputs.
    const password = "mySecurePassword123";
    const salt = "mySuperSecretSalt";

    // ACT: Call the function twice with the exact same inputs.
    const result1 = hashedPasswordWithSalt(password, salt);
    const result2 = hashedPasswordWithSalt(password, salt);

    // ASSERT: Verify the outcome.
    expect(result1.password).toBe(result2.password);
  });
});
