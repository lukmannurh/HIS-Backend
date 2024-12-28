import { User } from "../models/index.js";
import bcrypt from "bcrypt";

// Hapus user (role=user) oleh admin/owner
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findByPk(userId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Tidak boleh hapus admin/owner di sini
    if (targetUser.role === "admin" || targetUser.role === "owner") {
      return res
        .status(403)
        .json({ message: "Cannot delete admin or owner via this endpoint" });
    }

    await targetUser.destroy();
    return res.json({ message: "User (role=user) deleted successfully" });
  } catch (error) {
    console.error(error);
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
      return res.status(404).json({ message: "Admin not found" });
    }

    await targetAdmin.destroy();
    return res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// (Opsional) Admin/Owner bisa list semua user
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
    console.error(error);
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
      return res.status(404).json({ message: "User not found" });
    }

    // Hanya user itu sendiri yang boleh update
    // (kalau mau Admin/Owner bisa update user lain, perlu logika tambahan)
    // Di sini, userId dari token harus sama dengan currentUser.id
    if (currentUser.id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
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
      message: "Profile updated successfully",
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
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
