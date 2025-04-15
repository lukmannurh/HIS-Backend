import bcrypt from "bcrypt";
import db from "../models/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.js";
import logger from "../middlewares/loggingMiddleware.js";

const User = db.User;
const RefreshTokenModel = db.RefreshToken;

export const registerUser = async ({ username, email, fullName, password, role }) => {
  // Cek apakah username sudah ada
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    throw { status: 400, message: "Username sudah ada" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Buat user baru (pastikan properti fullName dan email sesuai dengan model dan migration)
  const newUser = await User.create({
    username,
    email,
    fullName,
    password: hashedPassword,
    role: role || 'user'
  });

  logger.info(`User baru dibuat: ${username} dengan role ${newUser.role}`);

  return {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    fullName: newUser.fullName,
    role: newUser.role
  };
};

export const loginUser = async (loginData) => {
  const { username, password } = loginData;
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw { status: 401, message: "Username atau password salah" };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 401, message: "Username atau password salah" };
  }

  // Buat access token & refresh token
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshTokenValue = generateRefreshToken({
    id: user.id,
    role: user.role,
  });

  // Simpan refresh token di DB
  // Contoh: kadaluarsa 7 hari dari sekarang
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshTokenModel.create({
    token: refreshTokenValue,
    userId: user.id,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    user: { id: user.id, username: user.username, role: user.role },
  };
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    logger.warn("No refresh token in request");
    throw { status: 400, message: "Refresh token diperlukan" };
  }

  // Cari di DB
  const storedToken = await RefreshTokenModel.findOne({
    where: { token: refreshToken },
  });
  if (!storedToken) {
    logger.warn("Refresh token not found in DB => might be revoked");
    throw {
      status: 401,
      message: "Refresh token tidak ditemukan / sudah revoked",
    };
  }

  // Cek kadaluarsa
  if (new Date() > storedToken.expiresAt) {
    logger.info("Refresh token expired, removing from DB");
    await storedToken.destroy();
    throw { status: 401, message: "Refresh token kadaluarsa" };
  }

  // Verifikasi JWT
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    logger.warn(`Invalid refresh token: ${err.message}`);
    await storedToken.destroy(); // hapus token invalid
    throw { status: 401, message: "Refresh token tidak valid" };
  }

  // Generate access token baru
  const newAccessToken = generateAccessToken({
    id: decoded.id,
    role: decoded.role,
  });

  logger.info(`Access token diperbarui untuk user ID: ${decoded.id}`);

  return { accessToken: newAccessToken };
};

// (Opsional) revoke refresh token => endpoint logout
export const revokeRefreshToken = async (refreshToken) => {
  await RefreshTokenModel.destroy({ where: { token: refreshToken } });
  logger.info(`Refresh token revoked: ${refreshToken.substring(0, 30)}...`);
};
