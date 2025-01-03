import express from "express";
import * as userController from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { body, param } from "express-validator";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";
import ownerMiddleware from "../middlewares/ownerMiddleware.js";

const router = express.Router();

// 1) GET all users => policy-based, tidak perlu adminMiddleware lagi
router.get("/", authMiddleware, userController.getAllUsers);

// 2) GET user by ID => policy-based
router.get(
  "/:userId",
  authMiddleware,
  [
    param("userId")
      .isString()
      .notEmpty()
      .withMessage("ID pengguna harus diisi dan berupa string"),
  ],
  validationMiddleware,
  userController.getUserById
);

// 3) DELETE user => policy-based, tidak perlu adminMiddleware di sini
router.delete(
  "/:userId",
  authMiddleware,
  [
    param("userId")
      .isString()
      .notEmpty()
      .withMessage("ID pengguna harus diisi dan berupa string"),
  ],
  validationMiddleware,
  userController.deleteUser
);

// 4) DELETE admin => khusus owner
router.delete(
  "/admin/:adminId",
  authMiddleware,
  ownerMiddleware,
  [
    param("adminId")
      .isString()
      .notEmpty()
      .withMessage("ID admin harus diisi dan berupa string"),
  ],
  validationMiddleware,
  userController.deleteAdmin
);

// 5) UPDATE profile => policy-based (opsional)
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
    body("email").optional().isEmail().withMessage("Email harus valid"),
  ],
  validationMiddleware,
  userController.updateProfile
);

export default router;
