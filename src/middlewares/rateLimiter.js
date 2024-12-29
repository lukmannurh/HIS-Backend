import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Batasi setiap IP ke 10 permintaan per windowMs
  message: 'Terlalu banyak percobaan login dari IP ini, silakan coba lagi setelah 15 menit',
  standardHeaders: true, // Mengembalikan informasi rate limit di header `RateLimit-*`
  legacyHeaders: false, // Nonaktifkan header `X-RateLimit-*`
});

export default loginLimiter;
