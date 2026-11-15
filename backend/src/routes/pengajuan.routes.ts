import { Router } from "express";
import { pengajuanController } from "../controllers/pengajuan.controller";
import { authenticate } from "../middleware/authMiddleware";
import { requirePermission as can, requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { keputusanSchema } from "../validators";
import { slugParam } from "./params";

/** Modul rute pengajuan toko baru → di-mount di /api/pengajuan (khusus admin). */
const router = Router();

router.use(authenticate, requireRole("admin"), can("pengajuan:decide"));
router.param("slug", slugParam);

router.get("/", pengajuanController.list);
router.patch("/:slug", validate({ body: keputusanSchema }), pengajuanController.putuskan);

export default router;
