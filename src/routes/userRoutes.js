import express from "express";
import * as userController from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { body, param } from "express-validator";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";
import ownerMiddleware from "../middlewares/ownerMiddleware.js";

const router = express.Router();

/**
 * GET /api/users
 * - Owner: Melihat semua user
 * - Admin: Melihat hanya user dengan role 'user'
 * - User Biasa: Forbidden
 */
router.get("/", authMiddleware, userController.getAllUsers);

/**
 * GET /api/users/me
 * - Mengembalikan data profil pengguna yang sedang login
 */
router.get("/me", authMiddleware, userController.getUserProfile);

/**
 * GET /api/users/:userId
 * - Owner: Bisa melihat user apa saja
 * - Admin: Bisa melihat user jika targetUser.role !== 'owner'
 * - User Biasa: Hanya bisa melihat dirinya sendiri
 */
router.get(
  "/:userId",
  authMiddleware,
  [
    param("userId")
      .isUUID()
      .withMessage("ID pengguna harus berupa UUID yang valid"),
  ],
  validationMiddleware,
  userController.getUserById
);

/**
 * DELETE /api/users/:userId
 * - Owner: Boleh hapus siapa saja (admin/user)
 * - Admin: Hanya boleh hapus user dengan role 'user'
 * - User Biasa: Tidak boleh hapus siapapun
 */
router.delete(
  "/:userId",
  authMiddleware,
  [
    param("userId")
      .isUUID()
      .withMessage("ID pengguna harus berupa UUID yang valid"),
  ],
  validationMiddleware,
  userController.deleteUser
);

/**
 * DELETE /api/users/admin/:adminId
 * - Hanya Owner yang dapat menghapus admin
 */
router.delete(
  "/admin/:adminId",
  authMiddleware,
  ownerMiddleware,
  [
    param("adminId")
      .isUUID()
      .withMessage("ID admin harus berupa UUID yang valid"),
  ],
  validationMiddleware,
  userController.deleteAdmin
);

/**
 * PUT /api/users/profile
 * - Mengupdate profil pengguna yang sedang login
 */
router.put(
  "/profile",
  authMiddleware,
  [
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password harus minimal 6 karakter"),
    body("fullName")
      .optional()
      .isString()
      .withMessage("FullName harus berupa string"),
    body("address")
      .optional()
      .isString()
      .withMessage("Address harus berupa string"),
    body("age")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Age harus berupa integer positif"),
    body("gender")
      .optional()
      .isString()
      .withMessage("Gender harus berupa string"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Email harus valid"),
  ],
  validationMiddleware,
  userController.updateProfile
);

export default router;
