import express from "express";
import { register, login, refresh } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import loginLimiter from "../middlewares/rateLimiter.js";

import { body } from "express-validator";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  authMiddleware,
  adminMiddleware,
  [
    body("username")
      .isString()
      .notEmpty()
      .withMessage("Username wajib diisi dan harus berupa string"),
    body("email").isEmail().withMessage("Email harus valid"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password harus minimal 6 karakter"),
    body("role")
      .optional()
      .isIn(["admin", "owner", "user"])
      .withMessage("Role harus 'admin', 'owner', atau 'user'"),
  ],
  validationMiddleware,
  register
);

router.post(
  "/login",
  loginLimiter, // Terapkan rate limiter pada login
  [
    body("username")
      .isString()
      .notEmpty()
      .withMessage("Username wajib diisi dan harus berupa string"),
    body("password")
      .isString()
      .notEmpty()
      .withMessage("Password wajib diisi dan harus berupa string"),
  ],
  validationMiddleware,
  login
);

router.post(
  "/refresh",
  [
    body("refreshToken")
      .isString()
      .notEmpty()
      .withMessage("Refresh token wajib diisi dan harus berupa string"),
  ],
  validationMiddleware,
  refresh
);

export default router;
