import express from "express";
import * as userController from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import ownerMiddleware from "../middlewares/ownerMiddleware.js";

const router = express.Router();

// GET all users (opsional, admin/owner)
router.get("/", authMiddleware, adminMiddleware, userController.getAllUsers);

// GET user by ID
router.get("/:userId", authMiddleware, userController.getUserById);

// DELETE user (role=user) - admin/owner
router.delete(
  "/:userId",
  authMiddleware,
  adminMiddleware,
  userController.deleteUser
);

// DELETE admin - owner only
router.delete(
  "/admin/:adminId",
  authMiddleware,
  ownerMiddleware,
  userController.deleteAdmin
);

// UPDATE profile (owner/admin/user -> update diri sendiri)
router.put("/profile", authMiddleware, userController.updateProfile);

export default router;
