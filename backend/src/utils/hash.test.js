import { hashPassword, comparePassword } from "../src/utils/hash.js";

describe("Hash Utility", () => {
  test("hashPassword should generate a valid hash", async () => {
    const password = "TestPassword123!@#";
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe("string");
    expect(hash).not.toBe(password);
  });

  test("comparePassword should verify correct password", async () => {
    const password = "TestPassword123!@#";
    const hash = await hashPassword(password);
    const isValid = await comparePassword(password, hash);

    expect(isValid).toBe(true);
  });

  test("comparePassword should reject wrong password", async () => {
    const password = "TestPassword123!@#";
    const wrongPassword = "WrongPassword456!@#";
    const hash = await hashPassword(password);
    const isValid = await comparePassword(wrongPassword, hash);

    expect(isValid).toBe(false);
  });
});
