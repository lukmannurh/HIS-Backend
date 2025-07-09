import db from "../models/index.js";
import logger from "../middlewares/loggingMiddleware.js";
import { Op } from "sequelize";
import {
  canViewAllReports,
  canViewReport,
  canCreateReport,
  canChangeReportStatus,
  canDeleteReport,
  canArchiveReport,
  canAutoArchive,
} from "../policies/reportPolicy.js";
import { checkHoax } from "../services/hoaxChecker.js";

const { Report, ArchivedReport, User } = db;

/**
 * CREATE report
 * – Hanya User
 * – Default reportStatus = 'diproses'
 */
export async function createReport(req, res) {
  try {
    if (!canCreateReport(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: only users can create reports" });
    }

    const { title, content, link } = req.body;
    const userId = req.user.id;
    const documentUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const { validationStatus, validationDetails, relatedNews } =
      await checkHoax(content, link, documentUrl);

    const newReport = await Report.create({
      title,
      content,
      link,
      userId,
      document: documentUrl,
      validationStatus,
      validationDetails,
      relatedNews,
      // reportStatus, adminExplanation, autoArchive, archiveThreshold use defaults
    });

    logger.info(`Report created by user ${userId}`);
    return res
      .status(201)
      .json({ message: "Report berhasil dibuat", data: newReport });
  } catch (error) {
    logger.error(`Error in createReport: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET all reports
 * – Admin: semua laporan
 * – User: hanya laporan miliknya sendiri
 * – Dukung filter ?period=day|week|month|year
 */
export async function getAllReports(req, res) {
  try {
    const { role, id: userId } = req.user;
    if (!canViewAllReports(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const where = {};
    if (role === "user") where.userId = userId;

    const { period } = req.query;
    if (period) {
      const now = new Date();
      let start;
      switch (period) {
        case "day":
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          start = new Date(now);
          start.setDate(now.getDate() - now.getDay());
          break;
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          start = new Date(now.getFullYear(), 0, 1);
          break;
      }
      if (start) where.createdAt = { [Op.gte]: start };
    }

    const reports = await Report.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "user", attributes: ["id", "username"] }],
    });
    return res.json(reports);
  } catch (error) {
    logger.error(`Error in getAllReports: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET report by ID
 * – Admin: semua
 * – User: hanya miliknya
 */
export async function getReportById(req, res) {
  try {
    const { role, id: userId } = req.user;
    if (!canViewReport(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const report = await Report.findByPk(req.params.reportId, {
      include: [{ model: User, as: "user", attributes: ["id", "username"] }],
    });
    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }
    if (role === "user" && report.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: not your report" });
    }

    return res.json(report);
  } catch (error) {
    logger.error(`Error in getReportById: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * UPDATE report status & optional validationStatus
 * – Hanya Admin
 * – reportStatus wajib 'diproses'| 'selesai'
 * – Jika 'selesai', adminExplanation wajib
 */
export async function updateReportStatus(req, res) {
  try {
    if (!canChangeReportStatus(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { reportStatus, adminExplanation, validationStatus } = req.body;
    if (!["diproses", "selesai"].includes(reportStatus)) {
      return res.status(400).json({ message: "Invalid reportStatus" });
    }
    if (reportStatus === "selesai" && !adminExplanation) {
      return res
        .status(400)
        .json({ message: "adminExplanation wajib diisi saat selesai" });
    }

    const report = await Report.findByPk(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    report.reportStatus = reportStatus;
    report.adminExplanation = adminExplanation;
    if (
      validationStatus &&
      ["valid", "hoax", "diragukan"].includes(validationStatus)
    ) {
      report.validationStatus = validationStatus;
    }
    await report.save();

    return res.json({ message: "Status updated", data: report });
  } catch (error) {
    logger.error(`Error in updateReportStatus: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * DELETE report
 * – Hanya Admin
 */
export async function deleteReport(req, res) {
  try {
    if (!canDeleteReport(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const report = await Report.findByPk(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    await report.destroy();
    return res.json({ message: "Report berhasil dihapus" });
  } catch (error) {
    logger.error(`Error in deleteReport: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * ARCHIVE report manually
 * – Hanya Admin
 */
export async function archiveReport(req, res) {
  try {
    if (!canArchiveReport(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const report = await Report.findByPk(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    await ArchivedReport.create({
      id: report.id,
      title: report.title,
      content: report.content,
      link: report.link,
      document: report.document,
      validationStatus: report.validationStatus,
      validationDetails: report.validationDetails,
      relatedNews: report.relatedNews,
      userId: report.userId,
      adminExplanation: report.adminExplanation,
      archivedAt: new Date(),
    });
    await report.destroy();

    return res.json({ message: "Laporan berhasil diarsipkan" });
  } catch (error) {
    logger.error(`Error in archiveReport: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * AUTO-ARCHIVE reports
 * – Hanya Admin
 * – threshold in { '1month','3month','6month','1year' }
 */
export async function autoArchiveReports(req, res) {
  try {
    if (!canAutoArchive(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { threshold } = req.body;
    const now = new Date();
    const cutoff = new Date(now);
    switch (threshold) {
      case "1month":
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case "3month":
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case "6month":
        cutoff.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return res.status(400).json({ message: "Invalid threshold" });
    }

    const toArchive = await Report.findAll({
      where: { reportStatus: "selesai", updatedAt: { [Op.lte]: cutoff } },
    });

    for (const rep of toArchive) {
      await ArchivedReport.create({
        id: rep.id,
        title: rep.title,
        content: rep.content,
        link: rep.link,
        document: rep.document,
        validationStatus: rep.validationStatus,
        validationDetails: rep.validationDetails,
        relatedNews: rep.relatedNews,
        userId: rep.userId,
        adminExplanation: rep.adminExplanation,
        archivedAt: new Date(),
      });
      await rep.destroy();
    }

    return res.json({ message: `Auto-archived ${toArchive.length} reports` });
  } catch (error) {
    logger.error(`Error in autoArchiveReports: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}
