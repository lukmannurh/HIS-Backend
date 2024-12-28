import bcrypt from "bcrypt";
import { User } from "../models/index.js";

export async function createStarterAccounts() {
  try {
    // Cek apakah sudah ada 'owner' di DB
    const ownerExist = await User.findOne({ where: { role: "owner" } });
    if (!ownerExist) {
      console.log("No Owner found. Creating starter accounts...");

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

      console.log(
        "Starter accounts created:\n" +
          "OWNER (owner/owner123)\n" +
          "ADMIN (admin/admin123)\n" +
          "USER (user/user123)"
      );
    } else {
      console.log(
        "Owner account already exists. Skipping starter accounts creation."
      );
    }
  } catch (error) {
    console.error("Error creating starter accounts:", error.message);
  }
}
