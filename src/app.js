import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import archiveRoutes from "./routes/archiveRoutes.js";
import logger from "./middlewares/loggingMiddleware.js";
import setupSwagger from "./swagger/swagger.js";

const app = express();

// Setup Swagger
setupSwagger(app);

// app.use(helmet());
// app.use(cors({
//   origin: ["http://203.194.112.226"],
//   methods: ["GET","POST","PUT","DELETE"],
//   allowedHeaders: ["Content-Type","Authorization"],
// }));

app.use(cors({
  origin: 'https://his-frontend-8u1n.vercel.app',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(express.json());

// Sajikan folder uploads sebagai static
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // atau set sesuai asal yang diizinkan, misalnya "http://localhost:3001"
  next();
}, express.static("uploads"));

app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) }
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/archives", archiveRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
