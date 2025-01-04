import express from "express";
import {
  register,
  login,
  refresh,
  logout,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { body } from "express-validator";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";
import loginLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

/**
 * REGISTER
 *   - Pakai authMiddleware agar user harus login (owner/admin) sebelum register user baru
 *   - validasi input: username, email, password, role
 *   - policy check ada di controller (canRegisterUser)
 */
router.post(
  "/register",
  authMiddleware,
  [
    body("username").isString().notEmpty().withMessage("Username wajib diisi"),
    body("email").isEmail().withMessage("Email harus valid"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password min 6 karakter"),
    body("role")
      .optional()
      .isIn(["admin", "owner", "user"])
      .withMessage("Role harus salah satu dari: admin, owner, user"),
  ],
  validationMiddleware,
  register
);

/**
 * LOGIN
 *   - publik (tidak perlu authMiddleware), tapi dibatasi oleh rateLimiter
 *   - validasi username & password
 */
router.post(
  "/login",
  loginLimiter,
  [
    body("username").isString().notEmpty().withMessage("Username wajib diisi"),
    body("password").isString().notEmpty().withMessage("Password wajib diisi"),
  ],
  validationMiddleware,
  login
);

/**
 * REFRESH TOKEN
 *   - user mengirim refreshToken, lalu kita balas accessToken baru
 *   - validasi body refreshToken
 *   - policy-based check opsional (biasanya publik, tapi refreshToken harus valid)
 */
router.post(
  "/refresh",
  [
    body("refreshToken")
      .isString()
      .notEmpty()
      .withMessage("Refresh token wajib diisi"),
  ],
  validationMiddleware,
  refresh
);

/**
 * LOGOUT (Opsional)
 *   - menghapus / revoke refreshToken dari DB
 *   - user harus login, lalu mengirim refreshToken mana yang mau dicabut
 */
router.post(
  "/logout",
  authMiddleware,
  [
    body("refreshToken")
      .isString()
      .notEmpty()
      .withMessage("Refresh token wajib diisi"),
  ],
  validationMiddleware,
  logout
);

export default router;
