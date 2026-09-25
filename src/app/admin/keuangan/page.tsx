"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, TrendingUp, TrendingDown, Wallet } from "lucide-react";

import { apiClient } from "@/lib/api";
import { Modal } from "@/components/admin/Modal";

type TransactionType = "INCOME" | "EXPENSE";

interface TransactionItem {
  id: string;
  amount: number;
  date: string;
  type: TransactionType;
  description: string;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  vendorName: string | null;
  period: { id: string; name: string } | null;
  event: { id: string; title: string } | null;
}

interface TransactionListResponse {
  data: TransactionItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface PeriodOption {
  id: string;
  name: string;
}

interface EventOption {
  id: string;
  title: string;
}

interface TransactionFormValues {
  amount: number;
  date: string;
  type: TransactionType;
  description: string;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  vendorName: string | null;
  periodId?: string;
  eventId?: string;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function todayIso(): string {
  // toISOString() pakai UTC — tanpa koreksi offset ini, di zona waktu
  // UTC+ (mis. WIB) tanggal defaultnya bisa mundur satu hari di jam-jam
  // dini hari (UTC belum ganti tanggal).
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export default function AdminKeuanganPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TransactionType | "">("");

  const list = useQuery({
    queryKey: ["admin-transaction", page, typeFilter],
    queryFn: async () => {
      const response = await apiClient.get<TransactionListResponse>("/transaction", {
        params: { page, limit: 15, type: typeFilter || undefined },
      });
      return response.data;
    },
  });

  const summary = useQuery({
    queryKey: ["transaction-summary"],
    queryFn: async () => {
      const response = await apiClient.get<TransactionSummary>("/transaction/summary");
      return response.data;
    },
  });

  const periods = useQuery({
    // Sama dengan query key yang dipakai PeriodeTab (useCrudResource
    // "admin-period") supaya mutasi di sana ikut invalidate cache ini.
    queryKey: ["admin-period"],
    queryFn: async () => (await apiClient.get<PeriodOption[]>("/period")).data,
  });

  const events = useQuery({
    // Sama dengan query key yang dipakai halaman Event (useCrudResource
    // "admin-event") supaya mutasi di sana ikut invalidate cache ini.
    queryKey: ["admin-event"],
    queryFn: async () => (await apiClient.get<EventOption[]>("/events")).data,
  });

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["admin-transaction"] });
    queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
  }

  const create = useMutation({
    mutationFn: async (data: TransactionFormValues) =>
      (await apiClient.post("/transaction", data)).data,
    onSuccess: invalidateAll,
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TransactionFormValues }) =>
      (await apiClient.patch(`/transaction/${id}`, data)).data,
    onSuccess: invalidateAll,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/transaction/${id}`),
    onSuccess: invalidateAll,
  });

  const [editing, setEditing] = useState<TransactionItem | null | "new">(null);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(todayIso());
  const [type, setType] = useState<TransactionType>("INCOME");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);
  const [vendorName, setVendorName] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [eventId, setEventId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function openCreate() {
    setAmount(0);
    setDate(todayIso());
    setType("INCOME");
    setDescription("");
    setQuantity(0);
    setUnit("");
    setUnitPrice(0);
    setVendorName("");
    setPeriodId("");
    setEventId("");
    setFormError(null);
    setEditing("new");
  }

  function openEdit(item: TransactionItem) {
    setAmount(item.amount);
    setDate(item.date.slice(0, 10));
    setType(item.type);
    setDescription(item.description);
    setQuantity(item.quantity ?? 0);
    setUnit(item.unit ?? "");
    setUnitPrice(item.unitPrice ?? 0);
    setVendorName(item.vendorName ?? "");
    setPeriodId(item.period?.id ?? "");
    setEventId(item.event?.id ?? "");
    setFormError(null);
    setEditing(item);
  }

  // Sub total otomatis bila jumlah & harga diisi (server juga menghitung ulang).
  const subtotal = quantity > 0 && unitPrice > 0 ? quantity * unitPrice : null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const payload: TransactionFormValues = {
      amount: subtotal ?? amount,
      date: new Date(date).toISOString(),
      type,
      description,
      quantity: quantity > 0 ? quantity : null,
      unit: unit.trim() || null,
      unitPrice: unitPrice > 0 ? unitPrice : null,
      vendorName: vendorName.trim() || null,
      periodId: periodId || undefined,
      eventId: eventId || undefined,
    };

    try {
      if (editing === "new") {
        await create.mutateAsync(payload);
      } else if (editing) {
        await update.mutateAsync({ id: editing.id, data: payload });
      }
      setEditing(null);
    } catch {
      setFormError("Gagal menyimpan transaksi. Periksa kembali isian Anda.");
    }
  }

  async function handleDelete(item: TransactionItem) {
    if (!window.confirm(`Hapus transaksi "${item.description}"?`)) return;
    await remove.mutateAsync(item.id);
  }

  const isSaving = create.isPending || update.isPending;
  const meta = list.data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Laporan Keuangan</h1>
          <p className="text-sm text-slate-500">Catat pemasukan &amp; pengeluaran kas Paskatema.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
        >
          <Plus size={16} />
          Catat Transaksi
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pemasukan</p>
            <p className="text-lg font-semibold text-slate-900">
              {summary.data ? formatRupiah(summary.data.totalIncome) : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <TrendingDown size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pengeluaran</p>
            <p className="text-lg font-semibold text-slate-900">
              {summary.data ? formatRupiah(summary.data.totalExpense) : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <Wallet size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Saldo</p>
            <p className="text-lg font-semibold">
              {summary.data ? formatRupiah(summary.data.balance) : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <span className="text-sm font-semibold text-slate-700">Rincian Transaksi</span>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as TransactionType | "");
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-rose-400"
          >
            <option value="">Semua jenis</option>
            <option value="INCOME">Pemasukan</option>
            <option value="EXPENSE">Pengeluaran</option>
          </select>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Tanggal</th>
              <th className="px-5 py-3">Keterangan</th>
              <th className="px-5 py-3">Vendor</th>
              <th className="px-5 py-3 text-right">Jumlah</th>
              <th className="px-5 py-3">Satuan</th>
              <th className="px-5 py-3 text-right">Harga</th>
              <th className="px-5 py-3 text-right">Sub Total</th>
              <th className="px-5 py-3">Jenis</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.isLoading && (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-slate-400">
                  Memuat...
                </td>
              </tr>
            )}
            {list.data?.data.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-slate-400">
                  Belum ada transaksi.
                </td>
              </tr>
            )}
            {list.data?.data.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(item.date)}</td>
                <td className="max-w-xs truncate px-5 py-4 font-medium text-slate-900">
                  {item.description}
                  {item.period && (
                    <span className="ml-2 text-xs text-slate-400">· {item.period.name}</span>
                  )}
                </td>
                <td className="max-w-[10rem] truncate px-5 py-4 text-slate-600">
                  {item.vendorName ?? "—"}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right text-slate-600">
                  {item.quantity ?? "—"}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{item.unit ?? "—"}</td>
                <td className="whitespace-nowrap px-5 py-4 text-right text-slate-600">
                  {item.unitPrice != null ? formatRupiah(item.unitPrice) : "—"}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                  {formatRupiah(item.amount)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.type === "INCOME"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {item.type === "INCOME" ? "Masuk" : "Keluar"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {summary.data && (
            <tfoot className="border-t-2 border-slate-200 bg-slate-50 text-sm">
              <tr>
                <td colSpan={6} className="px-5 py-4 text-right font-semibold text-slate-700">
                  {typeFilter === "INCOME"
                    ? "Total Pemasukan"
                    : typeFilter === "EXPENSE"
                      ? "Total Pengeluaran"
                      : "Total (Saldo)"}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-slate-950">
                  {formatRupiah(
                    typeFilter === "INCOME"
                      ? summary.data.totalIncome
                      : typeFilter === "EXPENSE"
                        ? summary.data.totalExpense
                        : summary.data.balance,
                  )}
                </td>
                <td colSpan={2} className="px-5 py-4 text-xs text-slate-400">
                  semua halaman
                </td>
              </tr>
            </tfoot>
          )}
        </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
            <span>
              Halaman {meta.page} dari {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {editing && (
        <Modal
          title={editing === "new" ? "Catat Transaksi" : "Edit Transaksi"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Jenis</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TransactionType)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                >
                  <option value="INCOME">Pemasukan</option>
                  <option value="EXPENSE">Pengeluaran</option>
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Tanggal</span>
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Nama Vendor (opsional)</span>
              <input
                type="text"
                maxLength={100}
                placeholder="mis. Toko Sumber Rejeki"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>

            <div className="grid grid-cols-3 gap-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Jumlah</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={quantity || ""}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Satuan</span>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="pcs, dus"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Harga (Rp)</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={unitPrice || ""}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Sub Total (Rp)</span>
              <input
                required
                type="number"
                min={1}
                step={1}
                readOnly={subtotal !== null}
                value={(subtotal ?? amount) || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none read-only:bg-slate-50 read-only:text-slate-600 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
              <span className="block text-xs text-slate-400">
                {subtotal !== null
                  ? `${quantity} × ${formatRupiah(unitPrice)} (dihitung otomatis)`
                  : "Isi jumlah & harga untuk menghitung otomatis, atau ketik nominal langsung."}
              </span>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Keterangan</span>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Periode (opsional)</span>
                <select
                  value={periodId}
                  onChange={(e) => setPeriodId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                >
                  <option value="">—</option>
                  {periods.data?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Event (opsional)</span>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                >
                  <option value="">—</option>
                  {events.data?.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {formError && <p className="text-sm text-rose-600">{formError}</p>}

            <button
              type="submit"
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Simpan
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
