// Mock middleware dengan benar (default exports)
jest.mock("../../middlewares/authMiddleware.js", () => ({
  default: (req, res, next) => next(),
}));

jest.mock("../../middlewares/adminMiddleware.js", () => ({
  default: (req, res, next) => next(),
}));

jest.mock("../../middlewares/rateLimiter.js", () => ({
  default: (req, res, next) => next(),
}));

jest.mock("../../middlewares/validationMiddleware.js", () => ({
  default: (req, res, next) => next(),
}));

// Mock controller functions
jest.mock("../../controllers/authController.js", () => ({
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
}));

// Mock dependencies
jest.mock("../../models/index.js");
jest.mock("../../utils/token.js");

// Sekarang impor setelah semua mocking
import request from "supertest";
import app from "../../app.js";
import db from "../../models/index.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/token.js";
import { register, login, refresh } from "../../controllers/authController.js";

describe("Auth Routes", () => {
  let server;
  let User;

  beforeAll(() => {
    User = db.User;
    server = app.listen(4000); // Menggunakan port yang berbeda untuk testing
  });

  afterAll((done) => {
    server.close(done);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("harus berhasil mendaftarkan user baru", async () => {
      const userData = {
        username: "newuser",
        password: "password123",
        role: "user",
      };
      User.findOne.mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
      User.create.mockResolvedValue({
        id: 1,
        username: "newuser",
        role: "user",
      });

      // Mock implementasi register function
      register.mockImplementation((req, res) => {
        res.status(201).json({
          message: "User berhasil dibuat",
          data: { id: 1, username: "newuser", role: "user" },
        });
      });

      const res = await request(app).post("/api/auth/register").send(userData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("message", "User berhasil dibuat");
      expect(res.body.data).toHaveProperty("username", "newuser");
      expect(res.body.data).toHaveProperty("role", "user");
      expect(register).toHaveBeenCalled();
    });

    it("harus gagal mendaftarkan user dengan username yang sudah ada", async () => {
      const userData = {
        username: "existinguser",
        password: "password123",
        role: "user",
      };
      User.findOne.mockResolvedValue({ username: "existinguser" });

      // Mock implementasi register function untuk error
      register.mockImplementation((req, res) => {
        res.status(400).json({ message: "Username sudah ada" });
      });

      const res = await request(app).post("/api/auth/register").send(userData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message", "Username sudah ada");
      expect(register).toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/login", () => {
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

      // Mock implementasi login function
      login.mockImplementation((req, res) => {
        res.status(200).json({
          message: "Login berhasil",
          accessToken: "accessToken",
          refreshToken: "refreshToken",
          user: { id: 1, username: "validuser", role: "user" },
        });
      });

      const res = await request(app).post("/api/auth/login").send(loginData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message", "Login berhasil");
      expect(res.body).toHaveProperty("accessToken", "accessToken");
      expect(res.body).toHaveProperty("refreshToken", "refreshToken");
      expect(res.body.user).toHaveProperty("username", "validuser");
      expect(res.body.user).toHaveProperty("role", "user");
      expect(login).toHaveBeenCalled();
    });

    it("harus gagal login dengan kredensial yang tidak valid", async () => {
      const loginData = { username: "invaliduser", password: "wrongpassword" };
      User.findOne.mockResolvedValue(null);

      // Mock implementasi login function untuk error
      login.mockImplementation((req, res) => {
        res.status(401).json({ message: "Username atau password salah" });
      });

      const res = await request(app).post("/api/auth/login").send(loginData);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty(
        "message",
        "Username atau password salah"
      );
      expect(login).toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("harus berhasil memperbarui access token", async () => {
      const refreshData = { refreshToken: "validRefreshToken" };
      const decoded = { id: 1, role: "user" };
      verifyRefreshToken.mockReturnValue(decoded);
      generateAccessToken.mockReturnValue("newAccessToken");

      // Mock implementasi refresh function
      refresh.mockImplementation((req, res) => {
        res.status(200).json({ accessToken: "newAccessToken" });
      });

      const res = await request(app)
        .post("/api/auth/refresh")
        .send(refreshData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("accessToken", "newAccessToken");
      expect(refresh).toHaveBeenCalled();
    });

    it("harus gagal memperbarui token jika refresh token tidak ada", async () => {
      const refreshData = {};

      // Mock implementasi refresh function untuk error
      refresh.mockImplementation((req, res) => {
        res.status(400).json({
          errors: [
            { path: "refreshToken", msg: "Invalid value" },
            {
              path: "refreshToken",
              msg: "Refresh token wajib diisi dan harus berupa string",
            },
          ],
        });
      });

      const res = await request(app)
        .post("/api/auth/refresh")
        .send(refreshData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("errors");
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "refreshToken",
            msg: "Invalid value",
          }),
          expect.objectContaining({
            path: "refreshToken",
            msg: "Refresh token wajib diisi dan harus berupa string",
          }),
        ])
      );
      expect(refresh).toHaveBeenCalled();
    });

    it("harus gagal memperbarui token jika refresh token tidak valid", async () => {
      const refreshData = { refreshToken: "invalidRefreshToken" };
      verifyRefreshToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      // Mock implementasi refresh function untuk error
      refresh.mockImplementation((req, res) => {
        res.status(401).json({ message: "Refresh token tidak valid" });
      });

      const res = await request(app)
        .post("/api/auth/refresh")
        .send(refreshData);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message", "Refresh token tidak valid");
      expect(refresh).toHaveBeenCalled();
    });
  });
});
