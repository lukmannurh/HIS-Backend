import express from "express";
import { register, login, refresh } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Register (admin/owner only)
router.post("/register", authMiddleware, adminMiddleware, register);

// Login (umum)
router.post("/login", login);

// Refresh token (umum)
router.post("/refresh", refresh);

export default router;