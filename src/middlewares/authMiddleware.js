import { verifyAccessToken } from "../utils/token.js";
import logger from "./loggingMiddleware.js";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn('No token provided');
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    logger.warn('Invalid token format');
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    logger.warn('Token invalid or expired');
    return res.status(401).json({ message: "Token invalid or expired" });
  }
}
