import { Router } from "express";
import { env } from "../config/env";
import { produkController } from "../controllers/produk.controller";
import { authenticate } from "../middleware/authMiddleware";
import { uploadLimiter } from "../middleware/rateLimiter";
import { requirePermission as can } from "../middleware/requireRole";
import { cacheControl } from "../middleware/cacheControl";
import { imageUpload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { produkQuerySchema, produkSchema } from "../validators";
import { idParam } from "./params";

/** Modul rute produk → di-mount di /api/produk. */
const router = Router();

router.use(authenticate);
router.param("id", idParam);

router
  .route("/")
  .get(can("produk:read"), cacheControl(30), validate({ query: produkQuerySchema }), produkController.list)
  // Toko tujuan dicek kepemilikannya (ABAC) di service: pengrajin hanya bisa menambah ke tokonya sendiri.
  .post(can("produk:create"), validate({ body: produkSchema }), produkController.create);

/** Acuan harga per kategori (agregat seluruh sentra) untuk formulir Tambah Produk. */
router.get("/harga-pasar", can("produk:create"), cacheControl(300), produkController.hargaPasar);

router.delete("/:id", can("produk:delete"), produkController.remove);

/** Foto produk → Vercel Blob. Body = isi berkas mentah (image/jpeg | png | webp), sama seperti foto toko. */
router.put("/:id/foto", can("produk:create"), uploadLimiter, ...imageUpload({ maxBytes: env.blob.maxFotoBytes }), produkController.uploadFoto);

export default router;
