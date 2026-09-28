"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CheckCheck, Loader2, X } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { MEMBER_STATUS_CLASS, MEMBER_STATUS_LABEL, type MemberStatus } from "@/services/member";

export interface MembershipClaim {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  claimStatus: MemberStatus | null;
  claimAngkatan: number;
  claimGraduationYear: number | null;
  claimNote: string | null;
  claimAt: string;
}

export const MEMBERSHIP_CLAIMS_KEY = ["admin-membership-claims"];

export function useMembershipClaims() {
  return useQuery({
    queryKey: MEMBERSHIP_CLAIMS_KEY,
    queryFn: async () => (await apiClient.get<MembershipClaim[]>("/user/membership-claims")).data,
  });
}

function useInvalidateClaims() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: MEMBERSHIP_CLAIMS_KEY });
    queryClient.invalidateQueries({ queryKey: ["admin-members"] });
  };
}

/** Pengajuan anggota aktif/purna, dikelompokkan per angkatan. */
export function VerifikasiTab() {
  const claims = useMembershipClaims();

  const groups = useMemo(() => {
    const map = new Map<number, MembershipClaim[]>();
    for (const claim of claims.data ?? []) {
      map.set(claim.claimAngkatan, [...(map.get(claim.claimAngkatan) ?? []), claim]);
    }
    return [...map.entries()].sort(([a], [b]) => b - a);
  }, [claims.data]);

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-slate-500">
        Anggota aktif dan purna yang mendaftar sendiri. Cocokkan dengan data anggota, lalu setujui per orang atau
        sekaligus satu angkatan. Angkatan dan status bisa dikoreksi sebelum disetujui.
      </p>

      {claims.isLoading && <p className="text-sm text-slate-400">Memuat...</p>}
      {claims.data?.length === 0 && (
        <p className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
          Tidak ada pengajuan yang menunggu.
        </p>
      )}

      {groups.map(([angkatan, items]) => (
        <AngkatanGroup key={angkatan} angkatan={angkatan} items={items} />
      ))}
    </div>
  );
}

function AngkatanGroup({ angkatan, items }: { angkatan: number; items: MembershipClaim[] }) {
  const invalidate = useInvalidateClaims();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const approveAll = useMutation({
    mutationFn: async () =>
      (await apiClient.post<{ message: string }>("/user/membership-claims/approve-angkatan", { angkatan })).data,
    onSuccess: (data) => {
      setMessage({ ok: true, text: data.message });
      invalidate();
    },
    onError: (err) => setMessage({ ok: false, text: apiErrorMessage(err, "Gagal menyetujui.") }),
  });

  const aktif = items.filter((c) => c.claimStatus !== "PURNA").length;
  const purna = items.length - aktif;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Angkatan {angkatan}{" "}
          <span className="font-normal text-slate-500">
            · {items.length} pengajuan ({aktif} aktif, {purna} purna)
          </span>
        </h3>
        <button
          onClick={() => {
            setMessage(null);
            if (window.confirm(`Setujui semua ${items.length} pengajuan Angkatan ${angkatan}?`)) approveAll.mutate();
          }}
          disabled={approveAll.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {approveAll.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={14} />}
          Setujui semua Angkatan {angkatan}
        </button>
      </div>
      {message && (
        <p className={`rounded-xl px-3 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
          {message.text}
        </p>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </div>
    </section>
  );
}

function ClaimCard({ claim }: { claim: MembershipClaim }) {
  const invalidate = useInvalidateClaims();
  const [angkatan, setAngkatan] = useState(String(claim.claimAngkatan));
  const [status, setStatus] = useState<MemberStatus>(claim.claimStatus ?? "AKTIF");
  const [error, setError] = useState<string | null>(null);

  const review = useMutation({
    mutationFn: async (approve: boolean) =>
      (
        await apiClient.patch(`/user/${claim.id}/membership-claim`, {
          approve,
          ...(approve && { angkatan: Number(angkatan), memberStatus: status }),
        })
      ).data,
    onSuccess: invalidate,
    onError: (err) => setError(apiErrorMessage(err, "Gagal memproses pengajuan.")),
  });

  const claimed = claim.claimStatus ?? "AKTIF";

  return (
    <div className="space-y-3 rounded-[20px] border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{claim.name}</p>
          <p className="truncate text-xs text-slate-500">
            {claim.email}
            {claim.phone ? ` · ${claim.phone}` : ""}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${MEMBER_STATUS_CLASS[claimed]}`}>
          {MEMBER_STATUS_LABEL[claimed]}
        </span>
      </div>
      {(claim.claimNote || claim.claimGraduationYear) && (
        <p className="text-sm text-slate-600">
          {claim.claimGraduationYear && <>Lulus {claim.claimGraduationYear}. </>}
          {claim.claimNote}
        </p>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-500">Angkatan</span>
          <input
            type="number"
            min={1}
            value={angkatan}
            onChange={(e) => setAngkatan(e.target.value)}
            className="w-20 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-rose-400"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-500">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MemberStatus)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-rose-400"
          >
            <option value="AKTIF">Aktif</option>
            <option value="PURNA">Purna</option>
          </select>
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
          Setujui
        </button>
        <button
          onClick={() => {
            setError(null);
            if (window.confirm(`Tolak pengajuan ${claim.name}?`)) review.mutate(false);
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
