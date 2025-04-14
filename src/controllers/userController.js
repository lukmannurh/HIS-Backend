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
 * - Owner: Melihat semua user
 * - Admin: Hanya melihat user dengan role 'user'
 * - User Biasa: 403 Forbidden
 */
export const getAllUsers = async (req, res) => {
  try {
    const currentUser = { id: req.user.id, role: req.user.role };

    // Cek policy
    if (!canViewAllUsers(currentUser.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    let whereCondition = {};

    // Admin hanya ingin melihat user role='user'
    if (currentUser.role === "admin") {
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
 * GET /api/users/me
 * - Mengembalikan data profil pengguna yang sedang login
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "username",
        "email",
        "role",
        "fullName",
        "address",
        "age",
        "gender",
        "photo", // tambahkan ini untuk menyertakan foto profil
        "createdAt",
        "updatedAt",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res.json(user);
  } catch (error) {
    logger.error(`Error in getUserProfile: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/users/:userId
 * - Owner: Bisa lihat user apa saja
 * - Admin: Bisa lihat user jika targetUser.role !== 'owner'
 * - User Biasa: Hanya bisa lihat dirinya sendiri
 */
export async function getUserById(req, res) {
  try {
    const { userId } = req.params;
    const requestingUser = { id: req.user.id, role: req.user.role };

    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Gunakan policy
    if (
      !canViewUser(requestingUser, { id: targetUser.id, role: targetUser.role })
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
 * - Owner: Boleh hapus siapa saja (admin/user)
 * - Admin: Hanya boleh hapus user dengan role='user'
 * - User Biasa: Tidak boleh hapus siapapun
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = { id: req.user.id, role: req.user.role };

    const targetUser = await User.findByPk(userId);

    if (!targetUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Gunakan policy
    if (
      !canDeleteUser(requestingUser, {
        id: targetUser.id,
        role: targetUser.role,
      })
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await targetUser.destroy();
    logger.info(
      `User [${requestingUser.id}, role=${requestingUser.role}] deleted user [${targetUser.id}, role=${targetUser.role}]`
    );
    return res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    logger.error(`Error in deleteUser: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /api/users/admin/:adminId
 * - Hanya Owner yang dapat menghapus admin
 */
export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const requestingUser = { id: req.user.id, role: req.user.role };

    // Pastikan hanya admin yang dapat dihapus
    const targetAdmin = await User.findOne({
      where: { id: adminId, role: "admin" },
    });

    if (!targetAdmin) {
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    }

    // Meskipun sudah melalui ownerMiddleware, pastikan kembali dengan policy
    if (
      !canDeleteUser(requestingUser, {
        id: targetAdmin.id,
        role: targetAdmin.role,
      })
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await targetAdmin.destroy();
    logger.info(
      `Owner [${requestingUser.id}] deleted admin [${targetAdmin.id}]`
    );
    return res.json({ message: "Admin berhasil dihapus" });
  } catch (error) {
    logger.error(`Error in deleteAdmin: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /api/users/profile
 * - Mengupdate profil pengguna yang sedang login
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password, fullName, email, address, age, gender } = req.body;
    const requestingUser = { id: req.user.id, role: req.user.role };

    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    if (
      !canUpdateUser(requestingUser, {
        id: currentUser.id,
        role: currentUser.role,
      })
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      currentUser.password = hashed;
    }
    if (fullName !== undefined) currentUser.fullName = fullName;
    if (address !== undefined) currentUser.address = address;
    if (age !== undefined) currentUser.age = age;
    if (gender !== undefined) currentUser.gender = gender;
    if (email !== undefined) currentUser.email = email;
    if (req.file) {
      currentUser.photo = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }

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
        photo: currentUser.photo,
        createdAt: currentUser.createdAt,
        updatedAt: currentUser.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Error in updateProfile: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * UPDATE USER ROLE
 * - Endpoint ini hanya boleh diakses oleh Owner.
 * - Owner dapat mengubah role user (menuju "admin" atau "user").
 */
export const updateUserRole = async (req, res) => {
  try {
    // Pastikan hanya Owner yang dapat mengakses (tambahkan pengecekan ekstra meskipun juga ada middleware)
    if (req.user.role !== "owner") {
      return res
        .status(403)
        .json({ message: "Forbidden: Hanya Owner yang dapat mengubah role" });
    }

    const { userId } = req.params;
    const { role } = req.body;

    // Role yang valid hanya "admin" atau "user"
    if (role !== "admin" && role !== "user") {
      return res
        .status(400)
        .json({ message: "Role harus 'admin' atau 'user'" });
    }

    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    targetUser.role = role;
    await targetUser.save();

    logger.info(
      `Role user dengan ID ${userId} diubah menjadi ${role} oleh Owner ${req.user.id}`
    );
    return res.json({
      message: "Role user berhasil diperbarui",
      data: {
        id: targetUser.id,
        username: targetUser.username,
        role: targetUser.role,
      },
    });
  } catch (error) {
    logger.error(`Error in updateUserRole: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
