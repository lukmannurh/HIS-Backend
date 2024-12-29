import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import logger from "../middlewares/loggingMiddleware.js";

export async function createStarterAccounts() {
  try {
    // Cek apakah sudah ada 'owner' di DB
    const ownerExist = await User.findOne({ where: { role: "owner" } });
    if (!ownerExist) {
      logger.info("Tidak ada Owner ditemukan. Membuat akun starter...");

      // Owner
      const ownerUsername = "owner";
      const ownerPassword = "owner123";
      const hashedOwner = await bcrypt.hash(ownerPassword, 10);

      await User.create({
        username: ownerUsername,
        password: hashedOwner,
        role: "owner",
        fullName: "Owner Master",
      });

      // Admin
      const adminUsername = "admin";
      const adminPassword = "admin123";
      const hashedAdmin = await bcrypt.hash(adminPassword, 10);

      await User.create({
        username: adminUsername,
        password: hashedAdmin,
        role: "admin",
        fullName: "Admin Master",
      });

      // User
      const userUsername = "user";
      const userPassword = "user123";
      const hashedUser = await bcrypt.hash(userPassword, 10);

      await User.create({
        username: userUsername,
        password: hashedUser,
        role: "user",
        fullName: "User Biasa",
      });

      logger.info(
        "Akun starter berhasil dibuat:\n" +
        "OWNER (username: owner, password: owner123)\n" +
        "ADMIN (username: admin, password: admin123)\n" +
        "USER (username: user, password: user123)"
      );
    } else {
      logger.info(
        "Akun owner sudah ada. Melewati pembuatan akun starter."
      );
    }
  } catch (error) {
    logger.error(`Error dalam membuat akun starter: ${error.message}`);
  }
}
