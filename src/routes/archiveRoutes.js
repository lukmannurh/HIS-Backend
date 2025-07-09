import express from "express";
import { param } from "express-validator";
import {
  getAllArchives,
  getArchiveById,
  deleteArchive,
} from "../controllers/archiveController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";

const router = express.Router();

/**
 * GET /archives
 * – Owner/Admin: semua arsip
 * – User: hanya arsip miliknya
 */
router.get("/", authMiddleware, getAllArchives);

/**
 * GET /archives/:archiveId
 * – Owner/Admin: semua
 * – User: hanya miliknya
 */
router.get(
  "/:archiveId",
  authMiddleware,
  [param("archiveId").isUUID().withMessage("Archive ID harus UUID valid")],
  validationMiddleware,
  getArchiveById
);

/**
 * DELETE /archives/:archiveId
 * – Hanya Owner yang boleh menghapus arsip
 */
router.delete(
  "/:archiveId",
  authMiddleware,
  [param("archiveId").isUUID().withMessage("Archive ID harus UUID valid")],
  validationMiddleware,
  deleteArchive
);

export default router;
