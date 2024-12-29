import db from "../models/index.js";
import { checkHoax } from "../services/hoaxChecker.js";
import logger from "../middlewares/loggingMiddleware.js";

const Report = db.Report;

export async function createReport(req, res) {
  try {
    const { title, content, link } = req.body;
    const userId = req.userId;

    const { validationStatus, validationDetails } = await checkHoax(content, link);

    const newReport = await Report.create({
      title,
      content,
      userId,
      validationStatus,
      validationDetails,
    });

    return res.status(201).json({
      message: "Report berhasil dibuat",
      data: newReport,
    });
  } catch (error) {
    logger.error(`Error in createReport: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllReports(req, res) {
  try {
    let reports;
    if (req.userRole === "admin" || req.userRole === "owner") {
      reports = await Report.findAll({
        order: [["createdAt", "DESC"]],
        include: ["user"],
      });
    } else {
      reports = await Report.findAll({
        where: { userId: req.userId },
        order: [["createdAt", "DESC"]],
        include: ["user"],
      });
    }
    return res.json(reports);
  } catch (error) {
    logger.error(`Error in getAllReports: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getReportById(req, res) {
  try {
    const { reportId } = req.params;
    const report = await Report.findOne({
      where: { id: reportId },
      include: ["user"],
    });
    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    if (
      report.userId === req.userId ||
      req.userRole === "admin" ||
      req.userRole === "owner"
    ) {
      return res.json(report);
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }
  } catch (error) {
    logger.error(`Error in getReportById: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteReport(req, res) {
  try {
    const { reportId } = req.params;
    const report = await Report.findByPk(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    if (
      report.userId === req.userId ||
      req.userRole === "admin" ||
      req.userRole === "owner"
    ) {
      await report.destroy();
      return res.json({ message: "Report berhasil dihapus" });
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }
  } catch (error) {
    logger.error(`Error in deleteReport: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}
