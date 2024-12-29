import express from "express";
import { register, login, refresh } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import loginLimiter from "../middlewares/rateLimiter.js";

import { body } from 'express-validator';
import validationMiddleware from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Register (admin/owner only)
router.post(
  "/register",
  authMiddleware,
  adminMiddleware,
  [
    body('username').isString().notEmpty(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'user']),
  ],
  validationMiddleware,
  register
);

// Login (umum) dengan rate limiter
router.post(
  "/login",
  loginLimiter, // Terapkan rate limiter pada login
  [
    body('username').isString().notEmpty(),
    body('password').isString().notEmpty(),
  ],
  validationMiddleware,
  login
);

// Refresh token (umum)
router.post(
  "/refresh",
  [
    body('refreshToken').isString().notEmpty(),
  ],
  validationMiddleware,
  refresh
);

export default router;
