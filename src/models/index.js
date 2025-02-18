import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import logger from "../middlewares/loggingMiddleware.js";

import defineUser from "./user.js";
import defineReport from "./report.js";
import defineRefreshToken from "./refreshToken.js";
import defineArchivedReport from "./archivedReport.js"; 

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    logger.info("Koneksi ke database berhasil.");
  })
  .catch((err) => {
    logger.error("Koneksi ke database gagal:", err);
  });

const User = defineUser(sequelize);
const Report = defineReport(sequelize);
const RefreshToken = defineRefreshToken(sequelize);
const ArchivedReport = defineArchivedReport(sequelize);

User.hasMany(Report, {
  foreignKey: "userId",
  as: "reports",
});
Report.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Relasi untuk refresh token
RefreshToken.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Relasi untuk arsip: agar bisa mengakses data user pemilik arsip
ArchivedReport.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = User;
db.Report = Report;
db.RefreshToken = RefreshToken;
db.ArchivedReport = ArchivedReport;

export { User, Report, RefreshToken, ArchivedReport };
export default db;
