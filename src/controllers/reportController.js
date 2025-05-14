// src/controllers/reportController.js

import db from "../models/index.js";
import logger from "../middlewares/loggingMiddleware.js";
import {
  canViewAllReports,
  canViewReport,
  canCreateReport,
  canUpdateReport,
  canDeleteReport,
  canChangeReportStatus,
} from "../policies/reportPolicy.js";
import { checkHoax } from "../services/hoaxChecker.js";

const Report = db.Report;
const ArchivedReport = db.ArchivedReport;

/**
 * CREATE report
 */
export async function createReport(req, res) {
  try {
    if (!canCreateReport(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot create report" });
    }

    const { title, content, link } = req.body;
    const userId = req.user.id;
    let documentUrl = null;

    if (req.file) {
      documentUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }

    const { validationStatus, validationDetails, relatedNews } =
      await checkHoax(content, link, documentUrl);

    const newReport = await Report.create({
      title,
      content,
      userId,
      validationStatus,
      validationDetails,
      relatedNews,
      document: documentUrl,
    });

    logger.info(`Report created by user ID: ${userId}`, {
      timestamp: new Date().toISOString(),
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

/**
 * GET all reports
 *   - Owner/Admin/User => semua laporan
 *   - User              => hanya lihat field user.role
 *   - Owner/Admin       => lihat full user info
 */
export async function getAllReports(req, res) {
  try {
    const role = req.user.role;

    if (!canViewAllReports(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const reports = await Report.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.User,
          as: "user",
          attributes: role === "user" ? ["role"] : ["id", "username", "role"],
        },
      ],
    });

    return res.json(reports);
  } catch (error) {
    logger.error(`Error in getAllReports: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET single report by ID
 *   - Semua role boleh mengakses
 *   - User hanya melihat field user.role
 *   - Owner/Admin melihat full user info
 */
export async function getReportById(req, res) {
  try {
    const { reportId } = req.params;

    const report = await Report.findOne({
      where: { id: reportId },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "role"],
        },
      ],
    });

    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    // Cek izin berdasarkan role saja
    if (!canViewReport(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const result = report.toJSON();
    if (req.user.role === "user") {
      result.user = { role: result.user.role };
    }

    return res.json(result);
  } catch (error) {
    logger.error(`Error in getReportById: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * UPDATE report
 */
export async function updateReport(req, res) {
  try {
    const { reportId } = req.params;
    const { title, content, link } = req.body;

    const report = await Report.findOne({
      where: { id: reportId },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "role"],
        },
      ],
    });

    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    if (!canUpdateReport(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (title !== undefined) report.title = title;
    if (content !== undefined) report.content = content;
    if (link !== undefined) report.link = link;

    if (content !== undefined || link !== undefined) {
      const { validationStatus, validationDetails, relatedNews } =
        await checkHoax(report.content, report.link);
      report.validationStatus = validationStatus;
      report.validationDetails = validationDetails;
      report.relatedNews = relatedNews;
    }

    await report.save();

    logger.info(`Report updated by user ID: ${req.user.id}`, {
      timestamp: new Date().toISOString(),
    });

    return res.json({
      message: "Report berhasil diupdate",
      data: report,
    });
  } catch (error) {
    logger.error(`Error in updateReport: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * DELETE report
 */
export async function deleteReport(req, res) {
  try {
    const { reportId } = req.params;

    const report = await Report.findByPk(reportId, {
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "role"],
        },
      ],
    });

    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    if (!canDeleteReport(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await report.destroy();

    logger.info(`Report deleted by user ID: ${req.user.id}`, {
      timestamp: new Date().toISOString(),
    });

    return res.json({ message: "Report berhasil dihapus" });
  } catch (error) {
    logger.error(`Error in deleteReport: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * ARCHIVE report (change status to "selesai")
 */
export async function archiveReportByStatus(req, res) {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (status !== "selesai") {
      return res
        .status(400)
        .json({ message: "Status harus 'selesai' untuk arsip" });
    }
    if (!canChangeReportStatus(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const report = await Report.findOne({ where: { id: reportId } });
    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    await ArchivedReport.create({
      id: report.id,
      title: report.title,
      content: report.content,
      validationStatus: report.validationStatus,
      validationDetails: report.validationDetails,
      relatedNews: report.relatedNews,
      userId: report.userId,
    });

    await report.destroy();

    logger.info(
      `Report dengan ID ${reportId} telah diarsipkan oleh user ${req.user.id}`
    );

    return res.json({ message: "Laporan berhasil diarsipkan" });
  } catch (error) {
    logger.error(`Error in archiveReportByStatus: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}
