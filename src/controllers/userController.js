import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import logger from "../middlewares/loggingMiddleware.js";

// Hapus user (role=user) oleh admin/owner
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findByPk(userId);

    if (!targetUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Tidak boleh hapus admin/owner di sini
    if (targetUser.role === "admin" || targetUser.role === "owner") {
      return res
        .status(403)
        .json({ message: "Tidak dapat menghapus admin atau owner melalui endpoint ini" });
    }

    await targetUser.destroy();
    return res.json({ message: "User (role=user) berhasil dihapus" });
  } catch (error) {
    logger.error(`Error in deleteUser: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Hanya owner boleh menghapus admin
export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const targetAdmin = await User.findOne({
      where: { id: adminId, role: "admin" },
    });

    if (!targetAdmin) {
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    }

    await targetAdmin.destroy();
    return res.json({ message: "Admin berhasil dihapus" });
  } catch (error) {
    logger.error(`Error in deleteAdmin: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Admin/Owner bisa list semua user
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "username",
        "role",
        "fullName",
        "address",
        "age",
        "gender",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.json(users);
  } catch (error) {
    logger.error(`Error in getAllUsers: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update profil user (send di body):
 * - password (opsional, jika diisi maka di-hash)
 * - fullName
 * - address
 * - age
 * - gender
 * Tidak boleh ubah role
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // ID user yang sedang login
    const { password, fullName, address, age, gender } = req.body;

    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Update fields
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      currentUser.password = hashed;
    }
    if (fullName !== undefined) currentUser.fullName = fullName;
    if (address !== undefined) currentUser.address = address;
    if (age !== undefined) currentUser.age = age;
    if (gender !== undefined) currentUser.gender = gender;

    // role tidak boleh diubah

    await currentUser.save();

    return res.json({
      message: "Profil berhasil diperbarui",
      data: {
        id: currentUser.id,
        username: currentUser.username,
        role: currentUser.role, // tetap
        fullName: currentUser.fullName,
        address: currentUser.address,
        age: currentUser.age,
        gender: currentUser.gender,
      },
    });
  } catch (error) {
    logger.error(`Error in updateProfile: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET user by ID (Admin, Owner, atau si user itu sendiri)
 * - Admin/Owner bisa melihat user apa pun
 * - User biasa hanya bisa lihat dirinya sendiri
 */
export async function getUserById(req, res) {
  try {
    const { userId } = req.params;
    const requestingUserId = req.userId; // dari authMiddleware
    const requestingUserRole = req.userRole; // role dari JWT

    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Role-based logic:
    // - If admin or owner => allowed
    // - If user => only allowed if userId === requestingUserId
    if (
      requestingUserRole !== "admin" &&
      requestingUserRole !== "owner" &&
      requestingUserId !== userId
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Pilih field yang ditampilkan
    return res.json({
      id: targetUser.id,
      username: targetUser.username,
      role: targetUser.role,
      fullName: targetUser.fullName,
      address: targetUser.address,
      age: targetUser.age,
      gender: targetUser.gender,
      createdAt: targetUser.createdAt,
      updatedAt: targetUser.updatedAt,
    });
  } catch (error) {
    logger.error(`Error in getUserById: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}
