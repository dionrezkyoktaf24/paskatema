"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, X } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { PAYMENT_STATUS_LABEL, rupiah, type AdminPaymentRequest, type PaymentStatus } from "@/services/payment";

/**
 * Pembayaran QRIS berkode unik. Bendahara mencocokkan total (dengan kode
 * unik) di aplikasi merchant, lalu konfirmasi lunas → otomatis jadi pemasukan.
 */
export function PaymentsCard({ canConfirm }: { canConfirm: boolean }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PaymentStatus>("PENDING");
  const [error, setError] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["admin-payments", status],
    queryFn: async () => {
      const data = (await apiClient.get<AdminPaymentRequest[]>("/payments", { params: { status } })).data;
      const now = Date.now();
      return data.map((p) => ({ ...p, expired: p.status === "PENDING" && new Date(p.expiresAt).getTime() < now }));
    },
    refetchInterval: 60_000,
  });

  const action = useMutation({
    mutationFn: async ({ id, kind }: { id: string; kind: "confirm" | "cancel" }) =>
      (await apiClient.patch(`/payments/${id}/${kind}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-transaction"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
    },
    onError: (err) => setError(apiErrorMessage(err, "Gagal memproses pembayaran.")),
  });

  const pendingCount = status === "PENDING" ? (list.data?.filter((p) => !p.expired).length ?? 0) : null;

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">
            Pembayaran QRIS (kode unik){pendingCount ? <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{pendingCount} menunggu</span> : null}
          </p>
          <p className="text-xs text-slate-500">
            Cocokkan <b>total persis</b> di aplikasi merchant QRIS, lalu konfirmasi. Yang dikonfirmasi otomatis tercatat sebagai pemasukan.
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PaymentStatus)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-rose-400"
          aria-label="Status pembayaran"
        >
          <option value="PENDING">Menunggu</option>
          <option value="PAID">Lunas</option>
          <option value="CANCELLED">Dibatalkan</option>
        </select>
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      {list.isLoading && <p className="mt-4 text-sm text-slate-400">Memuat...</p>}
      {list.data?.length === 0 && <p className="mt-4 text-sm text-slate-400">Tidak ada pembayaran.</p>}

      {!!list.data?.length && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Untuk</th>
                <th className="py-2 pr-4">Pembayar</th>
                <th className="py-2 pr-4">Dibuat</th>
                <th className="py-2 text-right">{status === "PENDING" ? "Aksi" : "Status"}</th>
              </tr>
            </thead>
            <tbody>
              {list.data.map((p) => (
                <tr key={p.id} className={`border-t border-slate-100 ${p.expired ? "opacity-50" : ""}`}>
                  <td className="whitespace-nowrap py-3 pr-4">
                    <span className="font-semibold text-slate-900">{rupiah(p.totalAmount)}</span>
                    <span className="block text-xs text-slate-400">kode {p.uniqueCode}</span>
                  </td>
                  <td className="max-w-[14rem] py-3 pr-4 text-slate-700">{p.description}</td>
                  <td className="py-3 pr-4 text-slate-700">
                    {p.payerName}
                    {(p.payerContact || p.payer?.angkatan) && (
                      <span className="block text-xs text-slate-400">
                        {[p.payerContact, p.payer?.angkatan ? `Angkatan ${p.payer.angkatan}` : null].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 text-xs text-slate-500">
                    {new Date(p.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="py-3 text-right">
                    {status === "PENDING" ? (
                      p.expired ? (
                        <span className="text-xs text-slate-500">Kedaluwarsa</span>
                      ) : canConfirm ? (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setError(null);
                              if (window.confirm(`Sudah masuk ${rupiah(p.totalAmount)} dari ${p.payerName}? Akan dicatat sebagai pemasukan.`)) {
                                action.mutate({ id: p.id, kind: "confirm" });
                              }
                            }}
                            disabled={action.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {action.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Lunas
                          </button>
                          <button
                            onClick={() => {
                              setError(null);
                              if (window.confirm("Batalkan pembayaran ini?")) action.mutate({ id: p.id, kind: "cancel" });
                            }}
                            disabled={action.isPending}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            aria-label="Batalkan"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Menunggu bendahara</span>
                      )
                    ) : (
                      <span className="text-xs text-slate-500">
                        {PAYMENT_STATUS_LABEL[p.status]}
                        {p.confirmedBy ? ` · ${p.confirmedBy.name}` : ""}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
