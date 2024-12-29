import logger from "./loggingMiddleware.js";

export default function ownerMiddleware(req, res, next) {
  if (req.userRole !== "owner") {
    logger.warn(`User ${req.userId} mencoba mengakses rute owner`);
    return res.status(403).json({ message: "Forbidden: Owner only" });
  }
  next();
}
