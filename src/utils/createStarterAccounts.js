import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import logger from "../middlewares/loggingMiddleware.js";

export async function createStarterAccounts() {
  try {
    const ownerExist = await User.findOne({ where: { role: "owner" } });
    if (!ownerExist) {
      logger.info("Tidak ada Owner ditemukan. Membuat akun starter...");

      // Data akun starter
      const starters = [
        { username: "owner", password: "owner123", role: "owner",  fullName: "Owner Master" },
        { username: "admin", password: "admin123", role: "admin",  fullName: "Admin Master" },
        { username: "user",  password: "user123",  role: "user",   fullName: "User Biasa"  },
      ];

      for (const acct of starters) {
        const hash = await bcrypt.hash(acct.password, 10);
        await User.create({
          username: acct.username,
          email:    `${acct.username}@example.com`,  // <-- email wajib
          password: hash,
          role:     acct.role,
          fullName: acct.fullName,
        });
      }

      logger.info(
        "Akun starter berhasil dibuat:\n" +
        "OWNER (username: owner, password: owner123)\n" +
        "ADMIN (username: admin, password: admin123)\n" +
        "USER (username: user, password: user123)"
      );
    } else {
      logger.info("Akun owner sudah ada. Melewati pembuatan akun starter.");
    }
  } catch (error) {
    logger.error(`Error dalam membuat akun starter: ${error.message}`);
  }
}
