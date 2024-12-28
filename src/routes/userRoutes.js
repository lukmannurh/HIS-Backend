import express from "express";
import {
  deleteUser,
  deleteAdmin,
  getAllUsers,
  updateProfile,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import ownerMiddleware from "../middlewares/ownerMiddleware.js";

const router = express.Router();

// GET all users (opsional) - admin/owner
router.get("/", authMiddleware, adminMiddleware, getAllUsers);

// DELETE user (role=user) - admin/owner
router.delete("/:userId", authMiddleware, adminMiddleware, deleteUser);

// DELETE admin - owner only
router.delete("/admin/:adminId", authMiddleware, ownerMiddleware, deleteAdmin);

// UPDATE profile milik sendiri (owner/admin/user -> semua boleh update dirinya sendiri)
router.put("/profile", authMiddleware, updateProfile);

export default router;
