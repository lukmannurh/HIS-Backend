import bcrypt from "bcrypt";
import db from "../models/index.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const User = db.User;

export const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Hanya admin/owner yang boleh register (cek via adminMiddleware di route)
    // Boleh buat user atau admin. (Jika mau izinkan buat owner, tambahkan.)
    if (role && !["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'admin' or 'user'" });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: role || "user",
    });

    return res.status(201).json({
      message: "User created successfully",
      data: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    return res.json({
      message: "Login success",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
      const newAccessToken = generateAccessToken({
        id: decoded.id,
        role: decoded.role,
      });
      return res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
