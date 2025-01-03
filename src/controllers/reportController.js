import db from "../models/index.js";
import logger from "../middlewares/loggingMiddleware.js";
import { checkHoax } from "../services/hoaxChecker.js";

// Import policy
import {
  canViewAllReports,
  canViewReport,
  canCreateReport,
  canUpdateReport,
  canDeleteReport,
} from "../policies/reportPolicy.js";

const Report = db.Report;
const User = db.User; // Untuk join, jika diperlukan

/**
 * CREATE report
 * - Owner/Admin/User => semua bisa membuat (jika canCreateReport return true)
 */
export async function createReport(req, res) {
  try {
    // Cek policy
    if (!canCreateReport(req.userRole)) {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot create report" });
    }

    const { title, content, link } = req.body;
    const userId = req.userId;

    // Contoh validasi hoax
    const { validationStatus, validationDetails } = await checkHoax(
      content,
      link
    );

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

/**
 * GET all reports
 *   - Owner => semua
 *   - Admin => hanya milik user role="user"
 *   - User => hanya miliknya
 */
export async function getAllReports(req, res) {
  try {
    // Cek apakah user boleh memanggil endpoint "all reports"
    if (!canViewAllReports(req.userRole)) {
      // Berarti user adalah role "user", dia tidak boleh melihat semua,
      // => kita kembalikan hanya miliknya sendiri
      const reports = await Report.findAll({
        where: { userId: req.userId },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["id", "username", "role"],
          },
        ],
      });
      return res.json(reports);
    }

    // Jika role=owner => lihat semua
    // Jika role=admin => filter report milik user ber-role "user"

    if (req.userRole === "owner") {
      // Ambil semua
      const reports = await Report.findAll({
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["id", "username", "role"],
          },
        ],
      });
      return res.json(reports);
    } else if (req.userRole === "admin") {
      // Hanya report milik user role="user"
      // Caranya: gabung ke table user, filter role="user"
      const reports = await Report.findAll({
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["id", "username", "role"],
            where: { role: "user" }, // filter user role
          },
        ],
      });
      return res.json(reports);
    }
  } catch (error) {
    logger.error(`Error in getAllReports: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET report by ID
 *   - Owner => boleh lihat semua
 *   - Admin => boleh lihat jika report milik user role="user"
 *   - User => hanya boleh lihat report miliknya (report.userId === userId)
 */
export async function getReportById(req, res) {
  try {
    const { reportId } = req.params;

    // Kita juga butuh info "role" si pemilik report => gabung table user
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

    // Panggil policy (cek role pemilik report, dsb.)
    const reportOwnerRole = report.user.role;
    const reportOwnerId = report.user.id;

    if (
      !canViewReport(
        { id: req.userId, role: req.userRole },
        reportOwnerRole,
        reportOwnerId
      )
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(report);
  } catch (error) {
    logger.error(`Error in getReportById: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * UPDATE report
 *   - Owner => boleh update semua
 *   - Admin => boleh update jika pemilik report "user"
 *   - User => hanya boleh update miliknya
 */
export async function updateReport(req, res) {
  try {
    const { reportId } = req.params;
    const { title, content, link } = req.body;

    // Ambil data report, beserta info user (untuk policy check)
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

    // Policy check
    const reportOwnerRole = report.user.role;
    const reportOwnerId = report.user.id;

    if (
      !canUpdateReport(
        { id: req.userId, role: req.userRole },
        reportOwnerRole,
        reportOwnerId
      )
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Lakukan update field
    if (title !== undefined) {
      report.title = title;
    }
    if (content !== undefined) {
      report.content = content;
    }
    if (link !== undefined) {
      // Pastikan Anda punya kolom link di model/migration, atau sesuaikan
      report.link = link;
    }

    // Panggil checkHoax setiap kali content/link berubah
    // (Jika Anda mau checkHoax setiap update apa pun, panggil saja tanpa syarat)
    if (content !== undefined || link !== undefined) {
      const { validationStatus, validationDetails } = await checkHoax(
        report.content,
        report.link
      );
      report.validationStatus = validationStatus;
      report.validationDetails = validationDetails;
    }

    await report.save();

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
 *   - Owner => boleh hapus semua
 *   - Admin => boleh hapus jika pemilik report "user"
 *   - User => hanya boleh hapus report miliknya
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

    // Policy
    const reportOwnerRole = report.user.role;
    const reportOwnerId = report.user.id;

    if (
      !canDeleteReport(
        { id: req.userId, role: req.userRole },
        reportOwnerRole,
        reportOwnerId
      )
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await report.destroy();
    return res.json({ message: "Report berhasil dihapus" });
  } catch (error) {
    logger.error(`Error in deleteReport: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}
