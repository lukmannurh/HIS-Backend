import request from "supertest";
import app from "../../app.js";
import db from "../../models/index.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/token.js";

jest.mock("../../models/index.js");
jest.mock("../../utils/token.js");

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
      const userData = { username: "newuser", password: "password123", role: "user" };
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 1,
        username: "newuser",
        role: "user",
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("message", "User berhasil dibuat");
      expect(res.body.data).toHaveProperty("username", "newuser");
      expect(res.body.data).toHaveProperty("role", "user");
    });

    it("harus gagal mendaftarkan user dengan username yang sudah ada", async () => {
      const userData = { username: "existinguser", password: "password123", role: "user" };
      User.findOne.mockResolvedValue({ username: "existinguser" });

      const res = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message", "Username sudah ada");
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

      const res = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message", "Login berhasil");
      expect(res.body).toHaveProperty("accessToken", "accessToken");
      expect(res.body).toHaveProperty("refreshToken", "refreshToken");
      expect(res.body.user).toHaveProperty("username", "validuser");
      expect(res.body.user).toHaveProperty("role", "user");
    });

    it("harus gagal login dengan kredensial yang tidak valid", async () => {
      const loginData = { username: "invaliduser", password: "wrongpassword" };
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message", "Username atau password salah");
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("harus berhasil memperbarui access token", async () => {
      const refreshData = { refreshToken: "validRefreshToken" };
      const decoded = { id: 1, role: "user" };
      verifyRefreshToken.mockReturnValue(decoded);
      generateAccessToken.mockReturnValue("newAccessToken");

      const res = await request(app)
        .post("/api/auth/refresh")
        .send(refreshData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("accessToken", "newAccessToken");
    });

    it("harus gagal memperbarui token jika refresh token tidak ada", async () => {
      const refreshData = {};

      const res = await request(app)
        .post("/api/auth/refresh")
        .send(refreshData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message", "Refresh token diperlukan");
    });

    it("harus gagal memperbarui token jika refresh token tidak valid", async () => {
      const refreshData = { refreshToken: "invalidRefreshToken" };
      verifyRefreshToken.mockImplementation(() => { throw new Error("Invalid token"); });

      const res = await request(app)
        .post("/api/auth/refresh")
        .send(refreshData);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message", "Refresh token tidak valid");
    });
  });
});
