import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { encrypt, decrypt } from "./encryption.js";
import logger from '../middlewares/loggingMiddleware.js';

dotenv.config();

// Pastikan ENCRYPTION_KEY ada dan valid (sudah dilakukan di encryption.js)

export function generateAccessToken(payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  return encrypt(token);
}

export function generateRefreshToken(payload) {
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return encrypt(token);
}

export function verifyAccessToken(encryptedToken) {
  const token = decrypt(encryptedToken);
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function verifyRefreshToken(encryptedToken) {
  const token = decrypt(encryptedToken);
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}
