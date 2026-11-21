"use client";

import { Link2, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

/**
 * Akun pengrajin dibuat lewat pendaftaran mandiri (/daftar) lalu diaktifkan admin di halaman ini.
 * Tombol ini menyalin tautan pendaftaran untuk dibagikan (mis. ke grup WhatsApp paguyuban).
 */
export function SalinTautanDaftarButton() {
  const { showToast } = useToast();
  const [disalin, setDisalin] = useState(false);

  const salin = async () => {
    const tautan = `${window.location.origin}/daftar`;
    try {
      await navigator.clipboard.writeText(tautan);
      setDisalin(true);
      showToast("Tautan pendaftaran disalin. Bagikan ke pengrajin, lalu aktifkan akunnya di tabel ini.");
      setTimeout(() => setDisalin(false), 2500);
    } catch {
      showToast(`Salin manual tautan ini: ${tautan}`, "info");
    }
  };

  return (
    <Button size="lg" onClick={salin}>
      {disalin ? <Link2 className="size-4" aria-hidden /> : <UserPlus className="size-4" aria-hidden />}
      {disalin ? "Tautan Disalin" : "Undang Pengrajin Baru"}
    </Button>
  );
}
