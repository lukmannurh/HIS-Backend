import {
  registerUser,
  loginUser,
  refreshAccessToken,
  revokeRefreshToken,
} from "../services/authService.js";
import { canRegisterUser } from "../policies/authPolicy.js";

/**
 * REGISTER Controller
 *   - Memanggil canRegisterUser untuk cek apakah role user yang login diizinkan
 *   - Memanggil registerUser dari authService
 */
export const register = async (req, res) => {
  try {
    // Policy check
    if (!canRegisterUser({ id: req.userId, role: req.userRole })) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { username, email, password, role } = req.body;
    const user = await registerUser({ username, email, password, role });
    return res.status(201).json({
      message: "User berhasil dibuat",
      data: user,
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
