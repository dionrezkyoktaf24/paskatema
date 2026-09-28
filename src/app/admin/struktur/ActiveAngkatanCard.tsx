"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { ACTIVE_ANGKATAN_KEY, lastPurnaAngkatan, useActiveAngkatan } from "@/services/settings";

/** Pengaturan angkatan aktif; opsional sekaligus menerapkan status Aktif/Purna. */
export function ActiveAngkatanCard() {
  const queryClient = useQueryClient();
  const { data: active, isLoading } = useActiveAngkatan();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [applyStatus, setApplyStatus] = useState(true);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = useMutation({
    mutationFn: async (angkatan: number[]) =>
      (
        await apiClient.patch<{ message: string }>("/settings/active-angkatan", { angkatan, applyStatus })
      ).data,
    onSuccess: (data) => {
      setMessage({ ok: true, text: data.message });
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ACTIVE_ANGKATAN_KEY });
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
    onError: (err) => setMessage({ ok: false, text: apiErrorMessage(err, "Gagal menyimpan.") }),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    const angkatan = [...new Set(text.split(/[\s,]+/).filter(Boolean).map(Number))];
    if (angkatan.length === 0 || angkatan.some((n) => !Number.isInteger(n) || n < 1)) {
      setMessage({ ok: false, text: "Isi nomor angkatan, pisahkan dengan koma. Contoh: 33, 34, 35" });
      return;
    }
    if (applyStatus && !window.confirm(`Jadikan Angkatan ${angkatan.join(", ")} berstatus Aktif dan angkatan lainnya Purna?`)) {
      return;
    }
    save.mutate(angkatan);
  }

  const maxPurna = lastPurnaAngkatan(active);

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4">
      {!editing ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-slate-600">
            <b className="text-slate-900">Angkatan aktif:</b>{" "}
            {isLoading ? "…" : active && active.length > 0 ? active.join(", ") : "belum diatur"}
            {maxPurna !== null && <span className="text-slate-400"> · angkatan {maxPurna} ke bawah = Purna</span>}
          </p>
          <button
            onClick={() => {
              setText((active ?? []).join(", "));
              setMessage(null);
              setEditing(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
          >
            <Pencil size={13} />
            Ubah
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Angkatan aktif</span>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="33, 34, 35"
              className="w-full max-w-xs rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <span className="block text-xs text-slate-400">
              Dipakai di halaman daftar: anggota aktif memilih dari daftar ini; purna di bawahnya.
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={applyStatus}
              onChange={(e) => setApplyStatus(e.target.checked)}
              className="h-4 w-4 accent-rose-600"
            />
            Sekaligus perbarui status semua anggota (angkatan di daftar = Aktif, lainnya = Purna)
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={save.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {save.isPending && <Loader2 size={14} className="animate-spin" />}
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Batal
            </button>
          </div>
        </form>
      )}
      {message && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
