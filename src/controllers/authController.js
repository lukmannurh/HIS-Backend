import bcrypt from "bcrypt";
import db from "../models/index.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import logger from "../middlewares/loggingMiddleware.js";

dotenv.config();

const User = db.User;

export const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Hanya admin/owner yang boleh register (cek via adminMiddleware di route)
    // Boleh buat user atau admin. (Jika mau izinkan buat owner, tambahkan.)
    if (role && !["admin", "user"].includes(role)) {
      logger.warn(`Invalid role attempted: ${role}`);
      return res.status(400).json({ message: "Role must be 'admin' or 'user'" });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      logger.warn(`Registration attempt with existing username: ${username}`);
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: role || "user",
    });

    logger.info(`New user registered: ${username} with role ${newUser.role}`);

    return res.status(201).json({
      message: "User created successfully",
      data: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    logger.error(`Error in register: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      logger.warn(`Login failed for non-existing user: ${username}`);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed for user: ${username} due to incorrect password`);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    logger.info(`User logged in: ${username}`);

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
    logger.error(`Error in login: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn(`Refresh token missing in request`);
      return res.status(400).json({ message: "Refresh token is required" });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      logger.warn(`Invalid refresh token`);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    logger.info(`Access token refreshed for user ID: ${decoded.id}`);

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    logger.error(`Error in refresh: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
