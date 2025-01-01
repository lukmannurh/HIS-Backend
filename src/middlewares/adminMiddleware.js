import logger from "./loggingMiddleware.js";

const adminMiddleware = (req, res, next) => {
  if (req.userRole !== "admin" && req.userRole !== "owner") {
    logger.warn(
      `Access denied for user ID: ${req.userId} with role: ${req.userRole}`
    );
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

export default adminMiddleware;
