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

// Define semua model
const User = defineUser(sequelize);
const Report = defineReport(sequelize);
const RefreshToken = defineRefreshToken(sequelize);
const ArchivedReport = defineArchivedReport(sequelize);

// Kumpulkan models dalam satu objek
const models = {
  User,
  Report,
  RefreshToken,
  ArchivedReport,
};

// Jalankan associate() di setiap model yang memiliki method associate
Object.values(models)
  .filter((model) => typeof model.associate === "function")
  .forEach((model) => model.associate(models));

// Jika RefreshToken tidak memiliki associate, buat relasi manual:
// Setiap RefreshToken milik satu User, dan satu User bisa punya banyak RefreshToken
RefreshToken.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
User.hasMany(RefreshToken, {
  foreignKey: "userId",
  as: "refreshTokens",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

const db = {
  Sequelize,
  sequelize,
  ...models,
};

export { User, Report, RefreshToken, ArchivedReport };
export default db;
