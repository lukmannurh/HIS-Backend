import db from "../models/index.js";
import logger from "../middlewares/loggingMiddleware.js";
import {
  canViewArchive,
  canDeleteArchive,
} from "../policies/archivePolicy.js";

const { ArchivedReport, User } = db;

/**
 * GET /archives
 * – Owner/Admin: semua arsip
 * – User: hanya arsip miliknya
 */
export async function getAllArchives(req, res) {
  try {
    const currentUser = req.user;
    const where = ["owner", "admin"].includes(currentUser.role)
      ? {}
      : { userId: currentUser.id };

    const archives = await ArchivedReport.findAll({
      where,
      order: [["archivedAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "role"],
        },
      ],
    });
    return res.json(archives);
  } catch (error) {
    logger.error(`Error in getAllArchives: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /archives/:archiveId
 * – Owner/Admin: semua arsip
 * – User: hanya arsip miliknya
 */
export async function getArchiveById(req, res) {
  try {
    const { archiveId } = req.params;
    const archive = await ArchivedReport.findOne({
      where: { id: archiveId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "role"],
        },
      ],
    });
    if (!archive) {
      return res.status(404).json({ message: "Archived report not found" });
    }
    if (!canViewArchive(req.user, archive.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.json(archive);
  } catch (error) {
    logger.error(`Error in getArchiveById: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * DELETE /archives/:archiveId
 * – Hanya Owner yang boleh menghapus arsip
 */
export async function deleteArchive(req, res) {
  try {
    const { archiveId } = req.params;
    const archive = await ArchivedReport.findByPk(archiveId);
    if (!archive) {
      return res.status(404).json({ message: "Archived report not found" });
    }
    if (!canDeleteArchive(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await archive.destroy();
    logger.info(`Archived report ${archiveId} deleted by user ${req.user.id}`);
    return res.json({ message: "Archived report deleted successfully" });
  } catch (error) {
    logger.error(`Error in deleteArchive: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}
