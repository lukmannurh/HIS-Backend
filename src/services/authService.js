import bcrypt from "bcrypt";
import db from "../models/index.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.js";
import logger from "../middlewares/loggingMiddleware.js";

const User = db.User;

export const registerUser = async ({ username, password, role }) => {
  // Validasi role
  if (role && !["admin", "user"].includes(role)) {
    logger.warn(`Role tidak valid: ${role}`);
    throw { status: 400, message: "Role harus 'admin' atau 'user'" };
  }

  // Cek keberadaan user
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    logger.warn(`Percobaan registrasi dengan username yang sudah ada: ${username}`);
    throw { status: 400, message: "Username sudah ada" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Buat user baru
  const newUser = await User.create({
    username,
    password: hashedPassword,
    role: role || "user",
  });

  logger.info(`User baru terdaftar: ${username} dengan role ${newUser.role}`);

  return {
    id: newUser.id,
    username: newUser.username,
    role: newUser.role,
  };
};

export const loginUser = async ({ username, password }) => {
  // Cari user berdasarkan username
  const user = await User.findOne({ where: { username } });
  if (!user) {
    logger.warn(`Login gagal untuk user tidak ada: ${username}`);
    throw { status: 401, message: "Username atau password salah" };
  }

  // Cek password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.warn(`Login gagal untuk user: ${username} karena password salah`);
    throw { status: 401, message: "Username atau password salah" };
  }

  // Generate token
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

  logger.info(`User berhasil login: ${username}`);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    logger.warn(`Refresh token tidak ada dalam permintaan`);
    throw { status: 400, message: "Refresh token diperlukan" };
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    logger.warn(`Refresh token tidak valid`);
    throw { status: 401, message: "Refresh token tidak valid" };
  }

  const newAccessToken = generateAccessToken({
    id: decoded.id,
    role: decoded.role,
  });

  logger.info(`Access token diperbarui untuk user ID: ${decoded.id}`);

  return { accessToken: newAccessToken };
};
