import logger from "./loggingMiddleware.js";

export default function ownerMiddleware(req, res, next) {
  if (req.user.role !== "owner") {
    logger.warn(`User ${req.user.id} mencoba mengakses rute owner`);
    return res.status(403).json({ message: "Forbidden: Owner only" });
  }
  next();
}
