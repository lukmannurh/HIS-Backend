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
 * – Hanya User yang boleh membuat
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
 * – Admin: lihat semua laporan
 * – User: lihat hanya laporan miliknya sendiri
 */
export async function getAllReports(req, res) {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    if (!canViewAllReports(role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot view reports" });
    }

    const where = role === "user" ? { userId } : {};

    const reports = await Report.findAll({
      where,
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
 * – Admin: bisa lihat semua
 * – User: hanya bisa lihat laporannya sendiri
 */
export async function getReportById(req, res) {
  try {
    const { reportId } = req.params;

    if (!canViewReport(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: cannot view report" });
    }

    const report = await Report.findOne({
      where: { id: reportId },
      include: [
        { model: db.User, as: "user", attributes: ["id", "username", "role"] },
      ],
    });
    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    // Owner dilarang
    if (req.user.role === "owner") {
      return res
        .status(403)
        .json({ message: "Forbidden: owner cannot view reports" });
    }
    // User hanya bisa lihat miliknya
    if (req.user.role === "user" && report.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: not your report" });
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
 * UPDATE report content
 * – Hanya Admin
 */
export async function updateReport(req, res) {
  try {
    const { reportId } = req.params;
    const { title, content, link } = req.body;

    if (!canUpdateReport(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: only admin can update reports" });
    }

    const report = await Report.findOne({ where: { id: reportId } });
    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
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

    logger.info(`Report updated by admin ID: ${req.user.id}`, {
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
 * – Hanya Admin
 */
export async function deleteReport(req, res) {
  try {
    const { reportId } = req.params;

    if (!canDeleteReport(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: only admin can delete reports" });
    }

    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    await report.destroy();

    logger.info(`Report deleted by admin ID: ${req.user.id}`, {
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
 * – Hanya Admin
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
      return res
        .status(403)
        .json({ message: "Forbidden: only admin can archive reports" });
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
      `Report dengan ID ${reportId} telah diarsipkan oleh admin ${req.user.id}`
    );

    return res.json({ message: "Laporan berhasil diarsipkan" });
  } catch (error) {
    logger.error(`Error in archiveReportByStatus: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}
