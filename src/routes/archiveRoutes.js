import express from "express";
import { getAllArchives, getArchiveById, deleteArchive } from "../controllers/archiveController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { param } from "express-validator";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// GET semua arsip
router.get("/", authMiddleware, getAllArchives);

// GET arsip berdasarkan ID
router.get(
  "/:archiveId",
  authMiddleware,
  [
    param("archiveId").isString().notEmpty().withMessage("Archive ID harus diisi")
  ],
  validationMiddleware,
  getArchiveById
);

// DELETE arsip (Owner saja)
router.delete(
  "/:archiveId",
  authMiddleware,
  [
    param("archiveId").isString().notEmpty().withMessage("Archive ID harus diisi")
  ],
  validationMiddleware,
  deleteArchive
);

export default router;
