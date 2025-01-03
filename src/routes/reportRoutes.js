import express from "express";
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
} from "../controllers/reportController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

import { body, param } from "express-validator";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// POST /api/reports - create
router.post(
  "/",
  authMiddleware,
  [
    body("title").isString().notEmpty().withMessage("Title wajib diisi"),
    body("content").isString().notEmpty().withMessage("Content wajib diisi"),
    body("link").optional().isURL().withMessage("Link harus URL valid jika diisi"),
  ],
  validationMiddleware,
  createReport
);

// GET /api/reports - getAll
router.get("/", authMiddleware, getAllReports);

// GET /api/reports/:reportId
router.get(
  "/:reportId",
  authMiddleware,
  [
    param("reportId").isString().notEmpty().withMessage("ID laporan harus diisi"),
  ],
  validationMiddleware,
  getReportById
);

// PUT /api/reports/:reportId - update
router.put(
  "/:reportId",
  authMiddleware,
  [
    param("reportId").isString().notEmpty().withMessage("ID laporan harus diisi"),
    body("title").optional().isString().withMessage("Title harus string"),
    body("content").optional().isString().withMessage("Content harus string"),
    body("link").optional().isURL().withMessage("Link harus URL valid"),
  ],
  validationMiddleware,
  updateReport
);

// DELETE /api/reports/:reportId
router.delete(
  "/:reportId",
  authMiddleware,
  [
    param("reportId").isString().notEmpty().withMessage("ID laporan harus diisi"),
  ],
  validationMiddleware,
  deleteReport
);

export default router;
