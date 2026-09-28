"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2 } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { authInputClass } from "@/components/auth/AuthCard";
import { MEMBER_STATUS_LABEL, type MemberStatus } from "@/services/member";
import { AngkatanField } from "@/components/auth/AngkatanField";

/**
 * Untuk akun yang angkatannya belum diisi: tampilkan pengajuan yang sedang
 * menunggu, atau form untuk mengajukan diri sebagai anggota aktif / purna.
 */
export function MembershipClaimCard({
  claimStatus,
  claimAngkatan,
  claimAt,
}: {
  claimStatus: MemberStatus | null;
  claimAngkatan: number | null;
  claimAt: string | null;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<MemberStatus>("AKTIF");
  const [angkatan, setAngkatan] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post("/user/me/membership-claim", {
          status,
          angkatan: Number(angkatan),
          graduationYear: status === "PURNA" && graduationYear ? Number(graduationYear) : undefined,
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
          Pengajuan sebagai <b>{MEMBER_STATUS_LABEL[claimStatus ?? "AKTIF"].toLowerCase()} Angkatan {claimAngkatan}</b>{" "}
          sedang menunggu verifikasi admin. Setelah disetujui, Anda bisa memakai forum, galeri angkatan, direktori, dan
          pemilihan.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
      {!open ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-slate-600">
            <b className="text-slate-900">Sudah menjadi anggota Paskatema?</b> Ajukan verifikasi angkatan Anda.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-2xl border border-rose-200 px-4 py-2 font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            Ajukan verifikasi
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
          <h2 className="text-lg font-semibold text-slate-950">Ajukan verifikasi keanggotaan</h2>
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 text-sm font-semibold" role="radiogroup" aria-label="Status">
            {(["AKTIF", "PURNA"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={status === value}
                onClick={() => setStatus(value)}
                className={`rounded-xl px-3 py-2 transition ${
                  status === value ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {value === "AKTIF" ? "Anggota aktif" : "Purna (alumni)"}
              </button>
            ))}
          </div>
          <div className={`grid gap-3 ${status === "PURNA" ? "grid-cols-2" : "grid-cols-1"}`}>
            <AngkatanField
              status={status}
              value={angkatan}
              onChange={setAngkatan}
              className={authInputClass}
            />
            {status === "PURNA" && (
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
            )}
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">
              Catatan untuk admin <span className="text-slate-400">(opsional)</span>
            </span>
            <input
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={status === "PURNA" ? "mis. jabatan dulu, nama panggilan" : "mis. kelas XI RPL 2, jabatan"}
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
