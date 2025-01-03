import express from "express";
import { register, login, refresh } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
// (adminMiddleware dihapus jika kita pakai policy saja)
import { body } from "express-validator";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";
import loginLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

// Hanya admin/owner (ditentukan di authPolicy) => panggil authMiddleware lalu panggil policy di controller
router.post(
  "/register",
  authMiddleware,
  [
    body("username").isString().notEmpty().withMessage("Username wajib diisi"),
    body("email").isEmail().withMessage("Email harus valid"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password min 6 karakter"),
    body("role").optional().isIn(["admin", "owner", "user"]),
  ],
  validationMiddleware,
  register
);

// Login => umumnya publik, jadi boleh tanpa authMiddleware
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

// Refresh => user sudah login, atau setidaknya punya refresh token
router.post(
  "/refresh",
  [
    body("refreshToken")
      .isString()
      .notEmpty()
      .withMessage("Refresh token wajib"),
  ],
  validationMiddleware,
  refresh
);

export default router;
