import { Router } from "express";
import { HttpError } from "../utils/httpError";
import akunRoutes from "./akun.routes";
import authRoutes from "./auth.routes";
import pengajuanRoutes from "./pengajuan.routes";
import produkRoutes from "./produk.routes";
import { dashboardRouter, laporanRouter } from "./report.routes";
import systemRoutes from "./system.routes";
import tokoRoutes from "./toko.routes";

/**
 * Routing modular: setiap fitur punya file router sendiri (express.Router())
 * lalu digabung di sini dengan prefiks path. File ini hanya "peta" API.
 *
 * Setiap modul memasang middleware-nya sendiri (router-level), mis. `authenticate`,
 * sehingga rute publik (/health, /auth/login) tidak perlu pengecualian khusus.
 */
const router = Router();

router.use("/health", systemRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRouter);
router.use("/laporan", laporanRouter);
router.use("/toko", tokoRoutes);
router.use("/pengajuan", pengajuanRoutes);
router.use("/produk", produkRoutes);
router.use("/akun", akunRoutes);

/**
 * Wildcard `/*splat` menangkap semua sisa path di bawah /api yang tidak cocok dengan rute mana pun.
 * `req.params.splat` berisi array segmen, mis. /api/a/b/c → ["a", "b", "c"].
 */
router.all("/*splat", (req) => {
  const segmen = (req.params as { splat: string[] }).splat;
  throw new HttpError(404, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`, {
    code: "ROUTE_NOT_FOUND",
    details: { segmen },
  });
});

export default router;
