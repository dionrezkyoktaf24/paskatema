"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2 } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { authInputClass } from "@/components/auth/AuthCard";

/**
 * Untuk akun yang angkatannya belum diisi: tampilkan klaim purna yang sedang
 * menunggu, atau form untuk mengajukan diri sebagai purna.
 */
export function PurnaClaimCard({
  claimAngkatan,
  claimAt,
}: {
  claimAngkatan: number | null;
  claimAt: string | null;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [angkatan, setAngkatan] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post("/user/me/purna-claim", {
          angkatan: Number(angkatan),
          graduationYear: graduationYear ? Number(graduationYear) : undefined,
          note: note.trim() || undefined,
        })
      ).data,
    onSuccess: (updated) => queryClient.setQueryData(["my-profile"], updated),
    onError: (err) => setError(apiErrorMessage(err, "Gagal mengirim pengajuan.")),
  });

  if (claimAt && claimAngkatan !== null) {
    return (
      <div className="flex items-start gap-3 rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <Clock size={18} className="mt-0.5 shrink-0" />
        <p>
          Pengajuan sebagai <b>purna Angkatan {claimAngkatan}</b> sedang menunggu verifikasi admin. Setelah disetujui,
          Anda bisa masuk direktori, forum, dan galeri angkatan.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
      {!open ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-slate-600">
            <b className="text-slate-900">Purna (alumni) Paskatema?</b> Ajukan verifikasi supaya tercatat di jaringan purna.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-2xl border border-rose-200 px-4 py-2 font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            Ajukan sebagai purna
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            setError(null);
            submit.mutate();
          }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-slate-950">Ajukan sebagai purna</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Angkatan</span>
              <input
                type="number"
                required
                min={1}
                max={999}
                value={angkatan}
                onChange={(e) => setAngkatan(e.target.value)}
                placeholder="mis. 25"
                className={authInputClass}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Tahun lulus <span className="text-slate-400">(opsional)</span>
              </span>
              <input
                type="number"
                min={1980}
                max={2100}
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="mis. 2021"
                className={authInputClass}
              />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">
              Catatan untuk admin <span className="text-slate-400">(opsional)</span>
            </span>
            <input
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="mis. jabatan dulu, nama panggilan"
              className={authInputClass}
            />
          </label>
          {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submit.isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-60"
            >
              {submit.isPending && <Loader2 size={15} className="animate-spin" />}
              Kirim pengajuan
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
