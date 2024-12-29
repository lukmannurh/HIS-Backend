import logger from "./loggingMiddleware.js";

export default (req, res, next) => {
  if (req.userRole !== "admin" && req.userRole !== "owner") {
    logger.warn(`User ${req.userId} mencoba mengakses rute admin`);
    return res.status(403).json({ message: "Forbidden: Admin/Owner only" });
  }
  next();
};
