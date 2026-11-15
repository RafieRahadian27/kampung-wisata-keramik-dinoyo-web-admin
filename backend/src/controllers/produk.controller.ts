import type { Request, Response } from "express";
import { currentUser } from "../middleware/authMiddleware";
import { type ProdukFilter, produkService } from "../services/produk.service";

export const produkController = {
  async list(req: Request, res: Response) {
    const user = currentUser(req);
    const [data, kategori, ringkasan] = await Promise.all([
      produkService.findAll(user, req.validated.query as ProdukFilter),
      produkService.kategori(user),
      produkService.ringkasan(user),
    ]);
    res.success(data, { meta: { total: data.length, kategori, ringkasan } });
  },

  /** `req.params.id` sudah berupa angka positif — dijamin oleh `router.param("id")`. */
  async remove(req: Request, res: Response) {
    await produkService.remove(currentUser(req), Number(req.params.id));
    res.success(null, { message: "Produk berhasil dihapus dari katalog" });
  },
};
