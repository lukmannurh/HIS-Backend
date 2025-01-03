import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import logger from "../middlewares/loggingMiddleware.js";

// Import policy functions
import {
  canViewAllUsers,
  canViewUser,
  canDeleteUser,
  canUpdateUser,
} from "../policies/userPolicy.js";

/**
 * GET /api/users
 * Owner => Melihat semua user
 * Admin => Hanya melihat user dengan role 'user'
 * User (biasa) => 403 Forbidden
 */
export const getAllUsers = async (req, res) => {
  try {
    // Cek policy
    if (!canViewAllUsers(req.userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    let whereCondition = {};

    // Admin hanya ingin melihat user role='user'
    if (req.userRole === "admin") {
      whereCondition = { role: "user" };
    }

    // Owner => whereCondition kosong => semua user

    const users = await User.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "username",
        "email",
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
 * GET /api/users/:userId
 * Owner => Bisa lihat user apa saja
 * Admin => Bisa lihat user jika targetUser.role !== 'owner'
 * User => Hanya bisa lihat dirinya sendiri
 */
export async function getUserById(req, res) {
  try {
    const { userId } = req.params;
    const requestingUserId = req.userId;
    const requestingUserRole = req.userRole;

    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Gunakan policy
    if (
      !canViewUser(
        { id: requestingUserId, role: requestingUserRole },
        { id: targetUser.id, role: targetUser.role }
      )
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Jika lolos policy, tampilkan data user
    return res.json({
      id: targetUser.id,
      username: targetUser.username,
      email: targetUser.email,
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

/**
 * DELETE /api/users/:userId
 * Owner => Boleh hapus siapa saja (admin/user/owner lain, tergantung kebijakan)
 * Admin => Hanya boleh hapus user role='user'
 * User => (default) tidak boleh hapus user lain
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.userId;
    const requestingUserRole = req.userRole;

    const targetUser = await User.findByPk(userId);

    if (!targetUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Gunakan policy
    if (
      !canDeleteUser(
        { id: requestingUserId, role: requestingUserRole },
        { id: targetUser.id, role: targetUser.role }
      )
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await targetUser.destroy();
    logger.info(
      `User [${requestingUserId}, role=${requestingUserRole}] deleted user [${targetUser.id}, role=${targetUser.role}]`
    );
    return res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    logger.error(`Error in deleteUser: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /api/users/admin/:adminId  (tetap seperti semula)
 *   - Hanya ownerMiddleware
 */
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

/**
 * PUT /api/users/profile
 * (Contoh saja, hanya user yang bersangkutan, admin/owner bisa update user?
 *  Bisa juga cek policy 'canUpdateUser' jika diperlukan.)
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // ID user yang sedang login
    const { password, fullName, email, address, age, gender } = req.body;

    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // (Jika mau ketat, panggil canUpdateUser di sini)
    // if (!canUpdateUser({id: userId, role: req.userRole}, {id: currentUser.id, role: currentUser.role})) {
    //   return res.status(403).json({ message: "Forbidden" });
    // }

    // Update fields
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      currentUser.password = hashed;
    }
    if (fullName !== undefined) currentUser.fullName = fullName;
    if (address !== undefined) currentUser.address = address;
    if (age !== undefined) currentUser.age = age;
    if (gender !== undefined) currentUser.gender = gender;
    if (email !== undefined) currentUser.email = email;

    await currentUser.save();

    return res.json({
      message: "Profil berhasil diperbarui",
      data: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        role: currentUser.role,
        fullName: currentUser.fullName,
        address: currentUser.address,
        age: currentUser.age,
        gender: currentUser.gender,
        createdAt: currentUser.createdAt,
        updatedAt: currentUser.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Error in updateProfile: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
