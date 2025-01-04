import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import logger from "../middlewares/loggingMiddleware.js";

import defineUser from "./user.js";
import defineReport from "./report.js";
import defineRefreshToken from "./refreshToken.js"; // Tambahan

dotenv.config();

// Inisialisasi Sequelize
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

// Coba koneksi
sequelize
  .authenticate()
  .then(() => {
    logger.info("Koneksi ke database berhasil.");
  })
  .catch((err) => {
    logger.error("Koneksi ke database gagal:", err);
  });

// Definisikan model
const User = defineUser(sequelize);
const Report = defineReport(sequelize);
const RefreshToken = defineRefreshToken(sequelize); // Baru

// Relasi
User.hasMany(Report, {
  foreignKey: "userId",
  as: "reports",
});
Report.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Relasi RefreshToken -> User (opsional, jika mau tahu user mana yang punya refresh token)
RefreshToken.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = User;
db.Report = Report;
db.RefreshToken = RefreshToken;

export { User, Report, RefreshToken };
export default db;
