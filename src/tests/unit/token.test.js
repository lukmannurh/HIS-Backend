// Mock seluruh module 'jsonwebtoken'
jest.mock("jsonwebtoken");

// Mock 'encrypt' dan 'decrypt' dari 'encryption.js' sebagai jest.fn()
jest.mock("../../utils/encryption.js", () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
}));

// Sekarang impor setelah mocking
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../utils/token.js";
import jwt from "jsonwebtoken";
import { encrypt, decrypt } from "../../utils/encryption.js";

describe("Token Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateAccessToken", () => {
    it("harus menghasilkan access token dengan payload yang benar", () => {
      const payload = { id: "user123", role: "user" };
      jwt.sign.mockReturnValue("accessTokenMock");
      encrypt.mockReturnValue("encryptedAccessTokenMock");

      const token = generateAccessToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });
      expect(encrypt).toHaveBeenCalledWith("accessTokenMock");
      expect(token).toBe("encryptedAccessTokenMock");
    });
  });

  describe("generateRefreshToken", () => {
    it("harus menghasilkan refresh token dengan payload yang benar", () => {
      const payload = { id: "user123", role: "user" };
      jwt.sign.mockReturnValue("refreshTokenMock");
      encrypt.mockReturnValue("encryptedRefreshTokenMock");

      const token = generateRefreshToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );
      expect(encrypt).toHaveBeenCalledWith("refreshTokenMock");
      expect(token).toBe("encryptedRefreshTokenMock");
    });
  });

  describe("verifyAccessToken", () => {
    it("harus memverifikasi access token dan mengembalikan payload yang didekode", () => {
      const encryptedToken = "encryptedAccessTokenMock";
      const decryptedToken = "accessTokenMock";
      const decoded = { id: "user123", role: "user" };

      decrypt.mockReturnValue(decryptedToken);
      jwt.verify.mockReturnValue(decoded);

      const result = verifyAccessToken(encryptedToken);

      expect(decrypt).toHaveBeenCalledWith(encryptedToken);
      expect(jwt.verify).toHaveBeenCalledWith(
        decryptedToken,
        process.env.JWT_SECRET
      );
      expect(result).toEqual(decoded);
    });

    it("harus melempar error jika access token tidak valid", () => {
      const encryptedToken = "invalidEncryptedAccessToken";
      const decryptedToken = "invalidAccessTokenMock";

      decrypt.mockReturnValue(decryptedToken);
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => verifyAccessToken(encryptedToken)).toThrow("Invalid token");
      expect(decrypt).toHaveBeenCalledWith(encryptedToken);
      expect(jwt.verify).toHaveBeenCalledWith(
        decryptedToken,
        process.env.JWT_SECRET
      );
    });
  });

  describe("verifyRefreshToken", () => {
    it("harus memverifikasi refresh token dan mengembalikan payload yang didekode", () => {
      const encryptedToken = "encryptedRefreshTokenMock";
      const decryptedToken = "refreshTokenMock";
      const decoded = { id: "user123", role: "user" };

      decrypt.mockReturnValue(decryptedToken);
      jwt.verify.mockReturnValue(decoded);

      const result = verifyRefreshToken(encryptedToken);

      expect(decrypt).toHaveBeenCalledWith(encryptedToken);
      expect(jwt.verify).toHaveBeenCalledWith(
        decryptedToken,
        process.env.JWT_REFRESH_SECRET
      );
      expect(result).toEqual(decoded);
    });

    it("harus melempar error jika refresh token tidak valid", () => {
      const encryptedToken = "invalidEncryptedRefreshToken";
      const decryptedToken = "invalidRefreshTokenMock";

      decrypt.mockReturnValue(decryptedToken);
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => verifyRefreshToken(encryptedToken)).toThrow("Invalid token");
      expect(decrypt).toHaveBeenCalledWith(encryptedToken);
      expect(jwt.verify).toHaveBeenCalledWith(
        decryptedToken,
        process.env.JWT_REFRESH_SECRET
      );
    });
  });

  describe("encrypt", () => {
    it("harus melempar error jika enkripsi gagal", () => {
      const text = "testToken";
      encrypt.mockImplementation(() => {
        throw new Error("Encryption failed");
      });

      expect(() => encrypt(text)).toThrow("Encryption failed");
      expect(encrypt).toHaveBeenCalledWith(text);
    });
  });

  describe("decrypt", () => {
    it("harus melempar error jika dekripsi gagal", () => {
      const encryptedText = "invalidEncryptedToken";
      decrypt.mockImplementation(() => {
        throw new Error("Decryption failed");
      });

      expect(() => decrypt(encryptedText)).toThrow("Decryption failed");
      expect(decrypt).toHaveBeenCalledWith(encryptedText);
    });

    it("harus melempar error jika format teks terenkripsi tidak valid", () => {
      const invalidFormat = "invalidFormatToken";
      decrypt.mockImplementation(() => {
        throw new Error("Format teks terenkripsi tidak valid");
      });

      expect(() => decrypt(invalidFormat)).toThrow(
        "Format teks terenkripsi tidak valid"
      );
      expect(decrypt).toHaveBeenCalledWith(invalidFormat);
    });
  });
});
