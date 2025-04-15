import {
  registerUser,
  loginUser,
  refreshAccessToken,
  revokeRefreshToken,
} from "../services/authService.js";
import { canRegisterUser } from "../policies/authPolicy.js";

/**
 * REGISTER Controller
 * - Hanya Owner dan Admin yang dapat membuat akun.
 * - Owner dapat memilih role "admin" atau "user".
 * - Admin hanya dapat membuat akun dengan role "user".
 */
export const register = async (req, res) => {
  try {
    const currentUser = req.user; // authMiddleware diharapkan sudah menetapkan req.user
    let { username, email, fullName, password, role } = req.body;

    // Validasi field wajib
    if (!username || !email || !fullName || !password) {
      return res.status(400).json({
        message: "Username, email, full name, and password are required"
      });
    }

    // Jika role tidak diberikan, default ke "user"
    if (!role) {
      role = "user";
    }

    // Cek kebijakan pendaftaran
    if (!canRegisterUser(currentUser, role)) {
      return res.status(403).json({
        message:
          "Forbidden: Anda tidak diizinkan membuat akun dengan role tersebut"
      });
    }

    const user = await registerUser({ username, email, fullName, password, role });
    return res.status(201).json({
      message: "User berhasil dibuat",
      data: user,
    });
  } catch (error) {
    console.error("Error in register controller:", error);
    return res.status(error.status || 500).json({ message: error.message || "Internal server error" });
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
