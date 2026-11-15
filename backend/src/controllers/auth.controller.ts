import type { CookieOptions, Request, Response } from "express";
import { env } from "../config/env";
import { currentUser } from "../middleware/authMiddleware";
import { authService, type RegisterInput } from "../services/auth.service";

/**
 * Atribut cookie sesi:
 * - HttpOnly  → tidak bisa dibaca JavaScript di browser (aman dari pencurian via XSS)
 * - Secure    → hanya dikirim lewat HTTPS (aktif di produksi)
 * - SameSite  → Strict: tidak ikut terkirim pada request dari situs lain (menahan CSRF)
 * - Max-Age   → umur cookie sama dengan umur sesi di database
 * - Path      → hanya dikirim ke endpoint /api
 */
const cookieOptions = (maxAgeMs?: number): CookieOptions => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "strict",
  path: "/api",
  ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
});

export const authController = {
  async login(req: Request, res: Response) {
    const { identifier, password, remember } = req.validated.body as { identifier: string; password: string; remember: boolean };
    const result = await authService.login({
      identifier,
      password,
      remember,
      client: { ipAddress: req.ip, userAgent: req.get("user-agent") },
    });

    res.cookie(env.sessionCookie, result.token, cookieOptions(result.maxAgeMs));
    res.success(
      { token: result.token, expiresAt: result.expiresAt.toISOString(), user: result.user },
      { message: "Login berhasil" },
    );
  },

  async register(req: Request, res: Response) {
    const akun = await authService.register(req.validated.body as unknown as RegisterInput);
    res.success(akun, { status: 201, message: "Pendaftaran berhasil. Akun Anda menunggu aktivasi admin paguyuban." });
  },

  me(req: Request, res: Response) {
    res.success(currentUser(req));
  },

  async logout(req: Request, res: Response) {
    if (req.auth) await authService.logout(req.auth.token);
    res.clearCookie(env.sessionCookie, cookieOptions());
    res.success(null, { message: "Sesi berhasil diakhiri" });
  },
};
