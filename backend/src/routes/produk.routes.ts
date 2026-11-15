import { Router } from "express";
import { produkController } from "../controllers/produk.controller";
import { authenticate } from "../middleware/authMiddleware";
import { requirePermission as can } from "../middleware/requireRole";
import { cacheControl } from "../middleware/cacheControl";
import { validate } from "../middleware/validate";
import { produkQuerySchema } from "../validators";
import { idParam } from "./params";

/** Modul rute produk → di-mount di /api/produk. */
const router = Router();

router.use(authenticate);
router.param("id", idParam);

router.get("/", can("produk:read"), cacheControl(30), validate({ query: produkQuerySchema }), produkController.list);
router.delete("/:id", can("produk:delete"), produkController.remove);

export default router;
