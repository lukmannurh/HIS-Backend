import { Router } from "express";
import * as reportController from "../controllers/reportController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, reportController.createReport);
router.get("/", authMiddleware, reportController.getAllReports);
router.get("/:reportId", authMiddleware, reportController.getReportById);
router.delete("/:reportId", authMiddleware, reportController.deleteReport);

export default router;
