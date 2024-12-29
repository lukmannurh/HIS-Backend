import { registerUser, loginUser, refreshAccessToken } from "../../services/authService.js";
import db from "../../models/index.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/token.js";

jest.mock("../../models/index.js");
jest.mock("../../utils/token.js");

describe("Auth Service", () => {
  let User;

  beforeAll(() => {
    User = db.User;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("harus berhasil mendaftarkan user baru", async () => {
      const userData = { username: "newuser", password: "password123", role: "user" };
      User.findOne.mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
      User.create.mockResolvedValue({
        id: 1,
        username: "newuser",
        role: "user",
      });

      const result = await registerUser(userData);

      expect(User.findOne).toHaveBeenCalledWith({ where: { username: "newuser" } });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(User.create).toHaveBeenCalledWith({
        username: "newuser",
        password: "hashedPassword",
        role: "user",
      });
      expect(result).toEqual({
        id: 1,
        username: "newuser",
        role: "user",
      });
    });

    it("harus melempar error jika username sudah ada", async () => {
      const userData = { username: "existinguser", password: "password123", role: "user" };
      User.findOne.mockResolvedValue({ username: "existinguser" });

      await expect(registerUser(userData)).rejects.toEqual({
        status: 400,
        message: "Username sudah ada",
      });
    });

    it("harus melempar error jika role tidak valid", async () => {
      const userData = { username: "user", password: "password123", role: "invalidRole" };

      await expect(registerUser(userData)).rejects.toEqual({
        status: 400,
        message: "Role harus 'admin' atau 'user'",
      });
    });
  });

  describe("loginUser", () => {
    it("harus berhasil login user", async () => {
      const loginData = { username: "validuser", password: "password123" };
      const user = {
        id: 1,
        username: "validuser",
        password: "hashedPassword",
        role: "user",
      };
      User.findOne.mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      generateAccessToken.mockReturnValue("accessToken");
      generateRefreshToken.mockReturnValue("refreshToken");

      const result = await loginUser(loginData);

      expect(User.findOne).toHaveBeenCalledWith({ where: { username: "validuser" } });
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedPassword");
      expect(generateAccessToken).toHaveBeenCalledWith({ id: 1, role: "user" });
      expect(generateRefreshToken).toHaveBeenCalledWith({ id: 1, role: "user" });
      expect(result).toEqual({
        accessToken: "accessToken",
        refreshToken: "refreshToken",
        user: {
          id: 1,
          username: "validuser",
          role: "user",
        },
      });
    });

    it("harus melempar error jika user tidak ada", async () => {
      const loginData = { username: "nonexistent", password: "password123" };
      User.findOne.mockResolvedValue(null);

      await expect(loginUser(loginData)).rejects.toEqual({
        status: 401,
        message: "Username atau password salah",
      });
    });

    it("harus melempar error jika password tidak cocok", async () => {
      const loginData = { username: "validuser", password: "wrongpassword" };
      const user = {
        id: 1,
        username: "validuser",
        password: "hashedPassword",
        role: "user",
      };
      User.findOne.mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await expect(loginUser(loginData)).rejects.toEqual({
        status: 401,
        message: "Username atau password salah",
      });
    });
  });

  describe("refreshAccessToken", () => {
    it("harus berhasil memperbarui access token", async () => {
      const refreshToken = "validRefreshToken";
      const decoded = { id: 1, role: "user" };
      verifyRefreshToken.mockReturnValue(decoded);
      generateAccessToken.mockReturnValue("newAccessToken");

      const result = await refreshAccessToken(refreshToken);

      expect(verifyRefreshToken).toHaveBeenCalledWith("validRefreshToken");
      expect(generateAccessToken).toHaveBeenCalledWith({ id: 1, role: "user" });
      expect(result).toEqual({ accessToken: "newAccessToken" });
    });

    it("harus melempar error jika refresh token tidak ada", async () => {
      await expect(refreshAccessToken(null)).rejects.toEqual({
        status: 400,
        message: "Refresh token diperlukan",
      });
    });

    it("harus melempar error jika refresh token tidak valid", async () => {
      const refreshToken = "invalidRefreshToken";
      verifyRefreshToken.mockImplementation(() => { throw new Error("Invalid token"); });

      await expect(refreshAccessToken(refreshToken)).rejects.toEqual({
        status: 401,
        message: "Refresh token tidak valid",
      });
    });
  });
});
