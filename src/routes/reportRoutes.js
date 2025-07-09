import express from "express";
import { body, param } from "express-validator";
import {
  createReport,
  getAllReports,
  getReportById,
  updateReportStatus,
  deleteReport,
  archiveReport,
  autoArchiveReports,
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
 * – Dukung filter ?period=day|week|month|year
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
 * PUT /reports/:reportId/status
 * – Hanya Admin yang boleh mengubah status
 * – reportStatus wajib "diproses" atau "selesai"
 * – Jika "selesai", adminExplanation wajib diisi
 * – validationStatus opsional
 */
router.put(
  "/:reportId/status",
  authMiddleware,
  [
    param("reportId").isUUID().withMessage("ID laporan harus UUID valid"),
    body("reportStatus")
      .isIn(["diproses", "selesai"])
      .withMessage("reportStatus harus 'diproses' atau 'selesai'"),
    body("adminExplanation")
      .if(body("reportStatus").equals("selesai"))
      .notEmpty()
      .withMessage("adminExplanation wajib diisi saat selesai"),
    body("validationStatus")
      .optional()
      .isIn(["valid", "hoax", "diragukan"])
      .withMessage("validationStatus harus 'valid','hoax', atau 'diragukan'"),
  ],
  validationMiddleware,
  updateReportStatus
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
 * PUT /reports/:reportId/archive
 * – Hanya Admin yang boleh arsipkan secara manual
 */
router.put(
  "/:reportId/archive",
  authMiddleware,
  [param("reportId").isUUID().withMessage("ID laporan harus UUID valid")],
  validationMiddleware,
  archiveReport
);

/**
 * POST /reports/archive/auto
 * – Hanya Admin yang boleh auto-archive
 * – threshold wajib salah satu dari '1month','3month','6month','1year'
 */
router.post(
  "/archive/auto",
  authMiddleware,
  [
    body("threshold")
      .isIn(["1month", "3month", "6month", "1year"])
      .withMessage("threshold harus '1month','3month','6month', atau '1year'"),
  ],
  validationMiddleware,
  autoArchiveReports
);

export default router;
