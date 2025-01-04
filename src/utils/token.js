import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { encrypt, decrypt } from "./encryption.js";

dotenv.config();

export function generateAccessToken(payload) {
  // Masa berlaku diatur via .env, default 15m
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
  return encrypt(token); 
}

export function generateRefreshToken(payload) {
  // Masa berlaku default 7d
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
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
