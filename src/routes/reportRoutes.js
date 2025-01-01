import express from "express";
import {
  createReport,
  getAllReports,
  getReportById,
  deleteReport,
} from "../controllers/reportController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

import { body, param } from "express-validator";
import { validationMiddleware } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  [
    body("title")
      .isString()
      .notEmpty()
      .withMessage("Title wajib diisi dan harus berupa string"),
    body("content")
      .isString()
      .notEmpty()
      .withMessage("Content wajib diisi dan harus berupa string"),
    body("link").isURL().withMessage("Link harus berupa URL yang valid"),
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
      .withMessage("ID laporan harus diisi dan berupa string"),
  ],
  validationMiddleware,
  getReportById
);

router.delete(
  "/:reportId",
  authMiddleware,
  [
    param("reportId")
      .isString()
      .notEmpty()
      .withMessage("ID laporan harus diisi dan berupa string"),
  ],
  validationMiddleware,
  deleteReport
);

export default router;
