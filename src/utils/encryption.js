import crypto from 'crypto';
import logger from '../middlewares/loggingMiddleware.js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 64 karakter heksadesimal
const IV_LENGTH = 16; // Untuk AES, selalu 16

// Pastikan ENCRYPTION_KEY sudah diatur
if (!ENCRYPTION_KEY) {
  logger.error('ENCRYPTION_KEY tidak diatur di variabel lingkungan');
  throw new Error('ENCRYPTION_KEY tidak diatur di variabel lingkungan');
}

// Verifikasi panjang dan format ENCRYPTION_KEY
if (!/^[a-fA-F0-9]{64}$/.test(ENCRYPTION_KEY)) {
  logger.error('ENCRYPTION_KEY harus berupa string heksadesimal sepanjang 64 karakter');
  throw new Error('Format ENCRYPTION_KEY tidak valid');
}

// Log sebagian dari ENCRYPTION_KEY untuk verifikasi (hindari log seluruh kunci)
logger.info(`ENCRYPTION_KEY dimuat: ${ENCRYPTION_KEY.substring(0, 10)}...`);

export function encrypt(text) {
  try {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const encryptedToken = iv.toString('hex') + ':' + encrypted;
    logger.info(`Token berhasil dienkripsi: ${encryptedToken.substring(0, 30)}...`);
    return encryptedToken;
  } catch (error) {
    logger.error(`Error enkripsi: ${error.message}`);
    throw error;
  }
}

export function decrypt(text) {
  try {
    let textParts = text.split(':');
    if (textParts.length !== 2) {
      throw new Error('Format teks terenkripsi tidak valid');
    }
    let iv = Buffer.from(textParts[0], 'hex');
    let encryptedText = Buffer.from(textParts[1], 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    logger.info(`Token berhasil didekripsi: ${decrypted.substring(0, 30)}...`);
    return decrypted;
  } catch (error) {
    logger.error(`Error dekripsi: ${error.message}`);
    throw error;
  }
}
