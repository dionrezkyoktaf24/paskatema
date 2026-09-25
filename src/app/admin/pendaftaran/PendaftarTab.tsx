"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Trash2, X } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { Modal } from "@/components/admin/Modal";
import {
  STATUS_CLASS,
  STATUS_LABEL,
  type FormSetting,
  type RegistrationItem,
  type RegistrationStatus,
} from "@/services/organisasi";

const selectClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function PendaftarTab() {
  const queryClient = useQueryClient();
  const [formId, setFormId] = useState("");
  const [status, setStatus] = useState<RegistrationStatus | "">("");
  const [openId, setOpenId] = useState<string | null>(null);

  const forms = useQuery({
    queryKey: ["admin-form-setting"],
    queryFn: async () => (await apiClient.get<FormSetting[]>("/form-setting")).data,
  });

  const list = useQuery({
    queryKey: ["admin-registrations", formId, status],
    queryFn: async () =>
      (
        await apiClient.get<RegistrationItem[]>("/registrations", {
          params: { formId: formId || undefined, status: status || undefined },
        })
      ).data,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
    queryClient.invalidateQueries({ queryKey: ["admin-registration"] });
    queryClient.invalidateQueries({ queryKey: ["admin-form-setting"] });
  }

  const counts = (list.data ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={formId} onChange={(e) => setFormId(e.target.value)} className={selectClass}>
          <option value="">Semua formulir</option>
          {forms.data?.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}
              {f.isActive ? " (aktif)" : ""}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as RegistrationStatus | "")} className={selectClass}>
          <option value="">Semua status</option>
          <option value="PENDING">Menunggu</option>
          <option value="ACCEPTED">Diterima</option>
          <option value="REJECTED">Ditolak</option>
        </select>
        {list.data && (
          <span className="text-sm text-slate-500">
            {list.data.length} pendaftar
            {!status && counts.PENDING ? ` · ${counts.PENDING} menunggu` : ""}
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">Formulir</th>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.isLoading && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">Memuat...</td>
                </tr>
              )}
              {list.data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">Belum ada pendaftar.</td>
                </tr>
              )}
              {list.data?.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{item.user?.name}</p>
                    <p className="text-xs text-slate-500">{item.user?.email}</p>
                  </td>
                  <td className="max-w-[14rem] truncate px-5 py-4 text-slate-600">{item.form.title}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(item.createdAt)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[item.status]}`}>
                      {STATUS_LABEL[item.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setOpenId(item.id)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
                    >
                      Lihat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {openId && <RegistrationDetail id={openId} onClose={() => setOpenId(null)} onChanged={invalidate} />}
    </div>
  );
}

function RegistrationDetail({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const detail = useQuery({
    queryKey: ["admin-registration", id],
    queryFn: async () => (await apiClient.get<RegistrationItem>(`/registrations/${id}`)).data,
  });

  const setStatus = useMutation({
    mutationFn: async (status: RegistrationStatus) =>
      (await apiClient.patch(`/registrations/${id}/status`, { status })).data,
    onSuccess: onChanged,
    onError: (err) => setError(apiErrorMessage(err, "Gagal mengubah status.")),
  });

  const remove = useMutation({
    mutationFn: async () => apiClient.delete(`/registrations/${id}`),
    onSuccess: () => {
      onChanged();
      onClose();
    },
    onError: (err) => setError(apiErrorMessage(err, "Gagal menghapus pendaftaran.")),
  });

  const data = detail.data;
  const schema = data?.form.schema ?? [];
  // Jawaban lama bisa punya key yang tidak ada lagi di schema; tetap tampilkan.
  const extraKeys = data ? Object.keys(data.answers).filter((k) => !schema.some((f) => f.key === k)) : [];

  return (
    <Modal title="Detail Pendaftar" onClose={onClose}>
      {detail.isLoading && <p className="text-sm text-slate-400">Memuat...</p>}
      {data && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-900">{data.user?.name}</p>
            <p className="text-slate-500">{data.user?.email}</p>
            {data.user?.phone && <p className="text-slate-500">{data.user.phone}</p>}
            <p className="mt-2 text-xs text-slate-400">
              {data.form.title} · {formatDate(data.createdAt)}
            </p>
          </div>

          <dl className="space-y-3 text-sm">
            {schema.map((field) => (
              <div key={field.key}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{field.label}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap break-words text-slate-800">
                  {data.answers[field.key] !== undefined ? String(data.answers[field.key]) : "—"}
                </dd>
              </div>
            ))}
            {extraKeys.map((key) => (
              <div key={key}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{key}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap break-words text-slate-800">{String(data.answers[key])}</dd>
              </div>
            ))}
          </dl>

          <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
            <span className="text-sm text-slate-500">Status:</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[data.status]}`}>
              {STATUS_LABEL[data.status]}
            </span>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatus.mutate("ACCEPTED")}
              disabled={setStatus.isPending || data.status === "ACCEPTED"}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {setStatus.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              Terima
            </button>
            <button
              onClick={() => setStatus.mutate("REJECTED")}
              disabled={setStatus.isPending || data.status === "REJECTED"}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:opacity-50"
            >
              <X size={15} />
              Tolak
            </button>
            {data.status !== "PENDING" && (
              <button
                onClick={() => setStatus.mutate("PENDING")}
                disabled={setStatus.isPending}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-slate-300 disabled:opacity-50"
              >
                Kembalikan ke Menunggu
              </button>
            )}
            <button
              onClick={() => {
                if (window.confirm("Hapus pendaftaran ini? Tindakan tidak bisa dibatalkan.")) remove.mutate();
              }}
              className="rounded-xl p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              aria-label="Hapus"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Setelah diterima, isi angkatan anggota di Struktur &amp; Periode → Anggota agar ia bisa ikut forum, galeri, dan pemilihan.
          </p>
        </div>
      )}
    </Modal>
  );
}
