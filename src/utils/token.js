import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from 'crypto';
import logger from '../middlewares/loggingMiddleware.js';

dotenv.config();

// Pastikan ENCRYPTION_KEY ada
if (!process.env.ENCRYPTION_KEY) {
  logger.error('ENCRYPTION_KEY is not set in environment variables');
  throw new Error('ENCRYPTION_KEY is not set in environment variables');
}

// Verifikasi panjang dan format ENCRYPTION_KEY
if (!/^[a-fA-F0-9]{64}$/.test(process.env.ENCRYPTION_KEY)) {
  logger.error('ENCRYPTION_KEY must be a 64-character hexadecimal string');
  throw new Error('Invalid ENCRYPTION_KEY format');
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 64 hex characters
const IV_LENGTH = 16; // For AES, this is always 16

// Log sebagian dari ENCRYPTION_KEY untuk verifikasi (hindari log seluruh kunci)
logger.info(`ENCRYPTION_KEY loaded: ${ENCRYPTION_KEY.substring(0, 10)}...`);

function encrypt(text) {
  try {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const encryptedToken = iv.toString('hex') + ':' + encrypted;
    logger.info(`Token encrypted successfully: ${encryptedToken.substring(0, 30)}...`);
    return encryptedToken;
  } catch (error) {
    logger.error(`Encryption error: ${error.message}`);
    throw error;
  }
}

function decrypt(text) {
  try {
    let textParts = text.split(':');
    if (textParts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    let iv = Buffer.from(textParts[0], 'hex');
    let encryptedText = Buffer.from(textParts[1], 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    logger.info(`Token decrypted successfully: ${decrypted.substring(0, 30)}...`);
    return decrypted;
  } catch (error) {
    logger.error(`Decryption error: ${error.message}`);
    throw error;
  }
}

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
