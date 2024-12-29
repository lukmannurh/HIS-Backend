import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import logger from "./middlewares/loggingMiddleware.js";

const app = express();

// Middleware
app.use(helmet()); // Tambahkan security headers
app.use(cors());
app.use(express.json());

// HTTP request logging menggunakan morgan dan winston
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

// Error handling middleware (pastikan setelah semua app.use lainnya)
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
