import type { Request, Response } from "express";
import { currentUser } from "../middleware/authMiddleware";
import { type Keputusan, pengajuanService } from "../services/pengajuan.service";

export const pengajuanController = {
  async list(_req: Request, res: Response) {
    const data = await pengajuanService.findAll();
    res.success(data, { meta: { total: data.length } });
  },

  async putuskan(req: Request<{ slug: string }>, res: Response) {
    const { keputusan } = req.validated.body as { keputusan: Keputusan };
    const hasil = await pengajuanService.putuskan(currentUser(req), req.params.slug, keputusan);
    const message = keputusan === "verifikasi" ? "Toko berhasil diverifikasi dan masuk direktori" : "Pengajuan toko ditolak";
    res.success(hasil, { message });
  },
};
