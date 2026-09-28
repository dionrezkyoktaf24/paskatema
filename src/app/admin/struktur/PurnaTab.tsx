"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, X } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";

export interface PurnaClaim {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  purnaClaimAngkatan: number;
  purnaClaimYear: number | null;
  purnaClaimNote: string | null;
  purnaClaimAt: string;
}

export const PURNA_CLAIMS_KEY = ["admin-purna-claims"];

export function usePurnaClaims() {
  return useQuery({
    queryKey: PURNA_CLAIMS_KEY,
    queryFn: async () => (await apiClient.get<PurnaClaim[]>("/user/purna-claims")).data,
  });
}

/** Klaim purna yang menunggu verifikasi admin. */
export function PurnaTab() {
  const claims = usePurnaClaims();

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Alumni yang mendaftar sebagai purna. Pastikan orangnya benar anggota angkatan tersebut, lalu setujui.
        Angkatan bisa dikoreksi sebelum disetujui.
      </p>

      {claims.isLoading && <p className="text-sm text-slate-400">Memuat...</p>}
      {claims.data?.length === 0 && (
        <p className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
          Tidak ada pengajuan purna yang menunggu.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {claims.data?.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </div>
    </div>
  );
}

function ClaimCard({ claim }: { claim: PurnaClaim }) {
  const queryClient = useQueryClient();
  const [angkatan, setAngkatan] = useState(String(claim.purnaClaimAngkatan));
  const [error, setError] = useState<string | null>(null);

  const review = useMutation({
    mutationFn: async (approve: boolean) =>
      (
        await apiClient.patch(`/user/${claim.id}/purna-claim`, {
          approve,
          ...(approve && { angkatan: Number(angkatan) }),
        })
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURNA_CLAIMS_KEY });
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
    onError: (err) => setError(apiErrorMessage(err, "Gagal memproses pengajuan.")),
  });

  return (
    <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-5">
      <div>
        <p className="font-semibold text-slate-900">{claim.name}</p>
        <p className="text-xs text-slate-500">
          {claim.email}
          {claim.phone ? ` · ${claim.phone}` : ""}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-slate-400">Mengaku angkatan</dt>
          <dd className="font-semibold text-slate-900">{claim.purnaClaimAngkatan}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Tahun lulus</dt>
          <dd className="text-slate-800">{claim.purnaClaimYear ?? "—"}</dd>
        </div>
        {claim.purnaClaimNote && (
          <div className="col-span-2">
            <dt className="text-xs text-slate-400">Catatan</dt>
            <dd className="text-slate-800">{claim.purnaClaimNote}</dd>
          </div>
        )}
      </dl>
      <p className="text-xs text-slate-400">
        Diajukan {new Date(claim.purnaClaimAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
      </p>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-500">Tetapkan angkatan</span>
          <input
            type="number"
            min={1}
            value={angkatan}
            onChange={(e) => setAngkatan(e.target.value)}
            className="w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-rose-400"
          />
        </label>
        <button
          onClick={() => {
            setError(null);
            review.mutate(true);
          }}
          disabled={review.isPending || !angkatan}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {review.isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          Setujui sebagai Purna
        </button>
        <button
          onClick={() => {
            setError(null);
            if (window.confirm(`Tolak pengajuan purna ${claim.name}?`)) review.mutate(false);
          }}
          disabled={review.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 disabled:opacity-60"
        >
          <X size={13} />
          Tolak
        </button>
      </div>
    </div>
  );
}
