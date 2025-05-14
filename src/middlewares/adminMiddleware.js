import logger from "./loggingMiddleware.js";

/**
 * Hanya Admin atau Owner yang boleh mengakses route ini.
 * Mengambil data user dari req.user (diset oleh authMiddleware).
 */
export default function adminMiddleware(req, res, next) {
  const user = req.user;
  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    logger.warn(
      `Access denied for user ID: ${user?.id} with role: ${user?.role}`
    );
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}
