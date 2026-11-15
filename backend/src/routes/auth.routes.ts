import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authMiddleware";
import { noStore } from "../middleware/cacheControl";
import { loginIpLimiter, loginLimiter, registerLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators";

/**
 * Modul rute autentikasi → di-mount di /api/auth (lihat routes/index.ts, dipasang di app.ts lewat /api).
 * Contoh Multiple Callback: setiap fungsi dijalankan berurutan dan memanggil next()
 * untuk menyerahkan estafet ke fungsi berikutnya; handler terakhir mengirim response.
 *
 *   POST /register  publik  → batasi jumlah daftar → validasi skema → buat akun (status menunggu)
 *   POST /login     publik  → batasi percobaan gagal → validasi skema → cek kata sandi → buat sesi
 *   GET  /me        login   → profil pengguna dari sesi
 *   POST /logout    login   → cabut sesi di database
 */
const router = Router();

router.post("/register", noStore, registerLimiter, validate({ body: registerSchema }), authController.register);
router.post("/login", noStore, loginIpLimiter, loginLimiter, validate({ body: loginSchema }), authController.login);
router.get("/me", authenticate, noStore, authController.me);
router.post("/logout", authenticate, authController.logout);

export default router;
