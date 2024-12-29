import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import logger from "../middlewares/loggingMiddleware.js";

// Import definisi model sebagai fungsi
import defineUser from "./user.js";
import defineReport from "./report.js";

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
    logging: false, // Nonaktifkan logging SQL
  }
);

// Uji koneksi ke database
sequelize.authenticate()
  .then(() => {
    logger.info("Koneksi ke database berhasil.");
  })
  .catch((err) => {
    logger.error("Koneksi ke database gagal:", err);
  });

// Definisikan model dengan memanggil fungsi definisi
const User = defineUser(sequelize);
const Report = defineReport(sequelize);

// Definisikan relasi
User.hasMany(Report, {
  foreignKey: "userId",
  as: "reports",
});

Report.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Simpan ke objek db untuk ekspor
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = User;
db.Report = Report;

export { User, Report };
export default db;
