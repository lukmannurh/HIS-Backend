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
const User = db.User;

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

    // Jika ada file yang diupload, buat URL untuk file tersebut
    if (req.file) {
      documentUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }

    // Panggil fungsi checkHoax dengan parameter tambahan documentUrl
    const { validationStatus, validationDetails, relatedNews } =
      await checkHoax(content, link, documentUrl);

    const newReport = await Report.create({
      title,
      content,
      userId,
      validationStatus,
      validationDetails,
      relatedNews,
      document: documentUrl, // simpan URL dokumen jika ada
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
 *   - Owner => semua
 *   - Admin => hanya milik user role="user" dan laporan milik admin sendiri
 *   - User => hanya miliknya
 */
export async function getAllReports(req, res) {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let reports;

    if (canViewAllReports(userRole)) {
      if (userRole === "owner") {
        // Owner dapat melihat semua laporan
        reports = await Report.findAll({
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: db.User,
              as: "user",
              attributes: ["id", "username", "role"],
            },
          ],
        });
      } else if (userRole === "admin") {
        // Admin dapat melihat laporan milik user dan laporan milik dirinya sendiri
        reports = await Report.findAll({
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: db.User,
              as: "user",
              attributes: ["id", "username", "role"],
              where: {
                [db.Sequelize.Op.or]: [
                  { role: "user" },
                  { id: userId, role: "admin" }, // Admin dapat melihat laporan milik dirinya sendiri
                ],
              },
            },
          ],
        });
      }
    } else {
      // User hanya dapat melihat laporan yang mereka buat sendiri
      reports = await Report.findAll({
        where: { userId: userId },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["id", "username", "role"],
          },
        ],
      });
    }

    return res.json(reports);
  } catch (error) {
    logger.error(`Error in getAllReports: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET report by ID
 *   - Owner => boleh lihat semua
 *   - Admin => boleh lihat jika report milik user role="user" atau dirinya sendiri
 *   - User => hanya boleh lihat report miliknya (report.userId === user.id)
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

    const reportOwnerRole = report.user.role;
    const reportOwnerId = report.user.id;

    // Cek apakah pengguna dapat melihat laporan ini
    const user = { id: req.user.id, role: req.user.role };
    if (!canViewReport(user, reportOwnerRole, reportOwnerId)) {
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
 *   - Admin => boleh update jika pemilik report "user" atau dirinya sendiri
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

    const reportOwnerRole = report.user.role;
    const reportOwnerId = report.user.id;

    // Cek apakah pengguna dapat memperbarui laporan ini
    const user = { id: req.user.id, role: req.user.role };
    if (!canUpdateReport(user, reportOwnerRole, reportOwnerId)) {
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
 *   - Owner => boleh hapus semua
 *   - Admin => boleh hapus jika pemilik report "user" atau dirinya sendiri
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

    const reportOwnerRole = report.user.role;
    const reportOwnerId = report.user.id;

    // Cek apakah pengguna dapat menghapus laporan ini
    const user = { id: req.user.id, role: req.user.role };
    if (!canDeleteReport(user, reportOwnerRole, reportOwnerId)) {
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

export async function archiveReportByStatus(req, res) {
  try {
    const { reportId } = req.params;
    const { status } = req.body; // ekspektasi: status "selesai"

    if (status !== "selesai") {
      return res
        .status(400)
        .json({ message: "Status harus 'selesai' untuk arsip" });
    }

    if (!canChangeReportStatus(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const report = await Report.findOne({ where: { id: reportId } });
    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    // Pindahkan laporan ke tabel arsip
    await ArchivedReport.create({
      id: report.id, // gunakan ID yang sama jika diperlukan
      title: report.title,
      content: report.content,
      validationStatus: report.validationStatus,
      validationDetails: report.validationDetails,
      relatedNews: report.relatedNews,
      userId: report.userId, // simpan userId untuk referensi
    });

    // Hapus laporan dari tabel Reports
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
