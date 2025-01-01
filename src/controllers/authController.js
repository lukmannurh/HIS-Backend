import {
  registerUser,
  loginUser,
  refreshAccessToken,
} from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await registerUser({ username, email, password, role });

    // Anda harus mengganti akses_token dan refresh_token dengan token yang sebenarnya
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
