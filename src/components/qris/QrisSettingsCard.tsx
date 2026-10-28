"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, QrCode, Trash2, Upload } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { decodeQrFromImage, isValidQris } from "@/lib/qris";
import { QRIS_KEY, useQris, type QrisSetting } from "@/services/qris";
import { QrisImage } from "@/components/qris/QrisImage";

/**
 * Pengaturan QRIS untuk bendahara/admin: unggah gambar QRIS statis (isinya
 * dibaca otomatis) atau tempel kodenya, plus catatan untuk pembayar.
 */
export function QrisSettingsCard() {
  const queryClient = useQueryClient();
  const qris = useQris();
  const [editing, setEditing] = useState(false);
  const [payload, setPayload] = useState("");
  const [note, setNote] = useState("");
  const [reading, setReading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = useMutation({
    mutationFn: async (body: { payload: string | null; note?: string }) =>
      (await apiClient.patch<{ qris: QrisSetting | null }>("/settings/qris", body)).data.qris,
    onSuccess: (saved) => {
      queryClient.setQueryData(QRIS_KEY, saved);
      setEditing(false);
      setMessage({ ok: true, text: saved ? "QRIS disimpan." : "QRIS dihapus." });
    },
    onError: (err) => setMessage({ ok: false, text: apiErrorMessage(err, "Gagal menyimpan QRIS.") }),
  });

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setMessage(null);
    setReading(true);
    try {
      const text = await decodeQrFromImage(file);
      if (!text) {
        setMessage({ ok: false, text: "QR tidak terbaca dari gambar. Coba gambar yang lebih jelas, atau tempel kodenya." });
      } else if (!isValidQris(text)) {
        setMessage({ ok: false, text: "QR terbaca, tetapi bukan kode QRIS yang valid." });
      } else {
        setPayload(text);
      }
    } finally {
      setReading(false);
    }
  }

  const current = qris.data;

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <QrCode size={18} />
          </span>
          <div>
            <p className="font-semibold text-slate-900">QRIS Paskatema</p>
            <p className="text-xs text-slate-500">
              {current ? `Aktif · ${current.merchantName.trim()}` : "Belum diatur"} · tampil di halaman Donasi &amp; Pembayaran
            </p>
          </div>
        </div>
        {!editing && (
          <div className="flex gap-2">
            <Link
              href="/qris"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-rose-300 hover:text-rose-600"
            >
              <ExternalLink size={13} />
              Lihat halaman
            </Link>
            <button
              onClick={() => {
                setPayload(current?.payload ?? "");
                setNote(current?.note ?? "");
                setMessage(null);
                setEditing(true);
              }}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
            >
              {current ? "Ganti QRIS" : "Atur QRIS"}
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {reading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              Unggah gambar QRIS statis
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={reading} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-500">Kode QRIS (terisi otomatis dari gambar, atau tempel manual)</span>
              <textarea
                rows={3}
                value={payload}
                onChange={(e) => setPayload(e.target.value.trim())}
                placeholder="000201010211..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs outline-none focus:border-rose-400"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-500">Catatan untuk pembayar (opsional)</span>
              <input
                maxLength={300}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="mis. Untuk iuran kas dan donasi kegiatan"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setMessage(null);
                  save.mutate({ payload, note: note.trim() || undefined });
                }}
                disabled={save.isPending || !payload || !isValidQris(payload)}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {save.isPending && <Loader2 size={14} className="animate-spin" />}
                Simpan
              </button>
              <button onClick={() => setEditing(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                Batal
              </button>
              {current && (
                <button
                  onClick={() => {
                    if (window.confirm("Hapus QRIS? Halaman Donasi & Pembayaran tidak akan menampilkan QR.")) {
                      save.mutate({ payload: null });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={14} />
                  Hapus
                </button>
              )}
            </div>
            {payload && !isValidQris(payload) && (
              <p className="text-xs text-amber-700">Kode belum valid sebagai QRIS (cek apakah tersalin utuh).</p>
            )}
          </div>
          {payload && isValidQris(payload) && (
            <div className="text-center">
              <QrisImage payload={payload} size={180} alt="Pratinjau QRIS" />
              <p className="mt-2 text-xs text-slate-400">Pratinjau. Pindai untuk memastikan namanya benar.</p>
            </div>
          )}
        </div>
      )}

      {message && (
        <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
