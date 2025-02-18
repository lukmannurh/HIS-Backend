import express from "express";
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  archiveReportByStatus,
} from "../controllers/reportController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { body, param } from "express-validator";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  [
    body("title").isString().notEmpty().withMessage("Title wajib diisi"),
    body("content").isString().notEmpty().withMessage("Content wajib diisi"),
    body("link")
      .optional()
      .isURL()
      .withMessage("Link harus URL valid jika diisi"),
  ],
  validationMiddleware,
  createReport
);

router.get("/", authMiddleware, getAllReports);

router.get(
  "/:reportId",
  authMiddleware,
  [
    param("reportId")
      .isString()
      .notEmpty()
      .withMessage("ID laporan harus diisi"),
  ],
  validationMiddleware,
  getReportById
);

router.put(
  "/:reportId",
  authMiddleware,
  [
    param("reportId")
      .isString()
      .notEmpty()
      .withMessage("ID laporan harus diisi"),
    body("title").optional().isString().withMessage("Title harus string"),
    body("content").optional().isString().withMessage("Content harus string"),
    body("link").optional().isURL().withMessage("Link harus URL valid"),
  ],
  validationMiddleware,
  updateReport
);

router.delete(
  "/:reportId",
  authMiddleware,
  [
    param("reportId")
      .isString()
      .notEmpty()
      .withMessage("ID laporan harus diisi"),
  ],
  validationMiddleware,
  deleteReport
);

// Endpoint untuk mengarsipkan laporan (memindahkan ke tabel arsip)
// Hanya menerima status "selesai"
router.put(
  "/:reportId/status",
  authMiddleware,
  [
    param("reportId")
      .isString()
      .notEmpty()
      .withMessage("ID laporan harus diisi"),
    body("status")
      .isIn(["diproses", "selesai"])
      .withMessage("Status harus 'diproses' atau 'selesai'"),
  ],
  validationMiddleware,
  archiveReportByStatus
);

export default router;
