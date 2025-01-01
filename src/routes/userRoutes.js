import express from "express";
import * as userController from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import ownerMiddleware from "../middlewares/ownerMiddleware.js";
import { body, param } from "express-validator";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, userController.getAllUsers);

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

router.delete(
  "/:userId",
  authMiddleware,
  adminMiddleware,
  [
    param("userId")
      .isString()
      .notEmpty()
      .withMessage("ID pengguna harus diisi dan berupa string"),
  ],
  validationMiddleware,
  userController.deleteUser
);

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
