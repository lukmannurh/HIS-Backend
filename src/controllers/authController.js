import {
  registerUser,
  loginUser,
  refreshAccessToken,
  revokeRefreshToken,
} from "../services/authService.js";
import { canRegisterUser } from "../policies/authPolicy.js";

/**
 * REGISTER Controller
 * - Hanya Owner/Admin
 * - Owner → role='admin', Admin → role='user'
 * - Wajib: username, email, fullName, password, rt, rw
 */
export const register = async (req, res) => {
  try {
    const currentUser = req.user;
    const { username, email, fullName, password, rt, rw } = req.body;

    // Validasi field wajib
    if (
      !username ||
      !email ||
      !fullName ||
      !password ||
      rt == null ||
      rw == null
    ) {
      return res.status(400).json({
        message: "Username, email, fullName, password, RT, dan RW wajib diisi",
      });
    }

    // Tentukan role baru
    let newRole;
    if (currentUser.role === "owner") {
      newRole = "admin";
    } else if (currentUser.role === "admin") {
      newRole = "user";
    } else {
      return res.status(403).json({ message: "Forbidden: tidak diizinkan" });
    }

    // Policy check (meski sudah tercakup di atas)
    if (!canRegisterUser(currentUser, newRole)) {
      return res.status(403).json({
        message: "Forbidden: Anda tidak diizinkan membuat akun dengan role ini",
      });
    }

    const user = await registerUser({
      username,
      email,
      fullName,
      password,
      role: newRole,
      rt,
      rw,
    });

    return res.status(201).json({
      message: "User berhasil dibuat",
      data: user,
    });
  } catch (error) {
    console.error("Error in register controller:", error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

/**
 * LOGIN Controller
 *   - Memanggil loginUser dari authService
 *   - Mengembalikan accessToken dan refreshToken
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await loginUser({ username, password });

    return res.json({
      message: "Login berhasil",
      ...result,
    });
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).json({ message: error.message });
    }
    // Error internal server
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * REFRESH TOKEN Controller
 *   - Menerima refreshToken dari body
 *   - Memanggil refreshAccessToken di authService
 *   - Return accessToken baru
 */
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await refreshAccessToken(refreshToken);

    return res.json(result);
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).json({ message: error.message });
    }
    // Error internal server
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * LOGOUT (Opsional)
 *   - Menerima refreshToken
 *   - Memanggil revokeRefreshToken di authService => menghapus token dr DB
 */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await revokeRefreshToken(refreshToken);
    return res.json({ message: "Logout berhasil, refresh token dicabut" });
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
