import express from "express";
import { body, param } from "express-validator";
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  archiveReportByStatus,
} from "../controllers/reportController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";

const router = express.Router();

/**
 * POST /reports
 * – Hanya User yang bisa membuat
 * – Upload satu file di field "media" (gambar/video)
 */
router.post(
  "/",
  authMiddleware,
  upload.single("media"),
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

/**
 * GET /reports
 * – Admin: semua laporan
 * – User: hanya laporan miliknya sendiri
 */
router.get("/", authMiddleware, getAllReports);

/**
 * GET /reports/:reportId
 * – Admin: semua
 * – User: hanya miliknya
 */
router.get(
  "/:reportId",
  authMiddleware,
  [param("reportId").isUUID().withMessage("ID laporan harus UUID valid")],
  validationMiddleware,
  getReportById
);

/**
 * PUT /reports/:reportId
 * – Hanya Admin yang boleh update
 * – Upload baru di field "media" opsional
 */
router.put(
  "/:reportId",
  authMiddleware,
  upload.single("media"),
  [
    param("reportId").isUUID().withMessage("ID laporan harus UUID valid"),
    body("title").optional().isString().withMessage("Title harus string"),
    body("content").optional().isString().withMessage("Content harus string"),
    body("link")
      .optional()
      .isURL()
      .withMessage("Link harus URL valid jika diisi"),
  ],
  validationMiddleware,
  updateReport
);

/**
 * DELETE /reports/:reportId
 * – Hanya Admin yang boleh hapus
 */
router.delete(
  "/:reportId",
  authMiddleware,
  [param("reportId").isUUID().withMessage("ID laporan harus UUID valid")],
  validationMiddleware,
  deleteReport
);

/**
 * PUT /reports/:reportId/status
 * – Hanya Admin yang boleh arsipkan (status 'selesai')
 */
router.put(
  "/:reportId/status",
  authMiddleware,
  [
    param("reportId").isUUID().withMessage("ID laporan harus UUID valid"),
    body("status")
      .equals("selesai")
      .withMessage("Status harus 'selesai' untuk arsip"),
  ],
  validationMiddleware,
  archiveReportByStatus
);

export default router;
