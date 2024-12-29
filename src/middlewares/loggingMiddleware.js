import winston from 'winston';
import path from 'path';

// Definisikan format log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
);

// Buat instance logger
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    // Tulis semua log dengan level `info` dan di bawahnya ke `combined.log`
    new winston.transports.File({ filename: path.join('logs', 'combined.log') }),
    // Tulis semua log dengan level `error` dan di bawahnya ke `error.log`
    new winston.transports.File({ filename: path.join('logs', 'error.log'), level: 'error' }),
  ],
});

// Jika bukan produksi, log juga ke console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
