"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Copy, Download, HeartHandshake, Info, Loader2, Wallet } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/footer/Footer";
import { QrisImage, downloadQris } from "@/components/qris/QrisImage";
import { toDynamicQris } from "@/lib/qris";
import { useQris, type QrisSetting } from "@/services/qris";
import { PAYMENT_STATUS_LABEL, effectiveStatus, rupiah, type PaymentRequest } from "@/services/payment";

type Purpose = "donasi" | "pembayaran";

const PRESETS: Record<Purpose, number[]> = {
  donasi: [10_000, 25_000, 50_000, 100_000],
  pembayaran: [10_000, 20_000, 50_000, 100_000],
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

function dynamicPayload(qris: QrisSetting, amount: number | null): string {
  if (!amount) return qris.payload;
  try {
    return toDynamicQris(qris.payload, amount);
  } catch {
    return qris.payload;
  }
}

export default function QrisPage() {
  const qris = useQris();
  // ?bayar=<id>: halaman pembayaran dengan kode unik (bisa dibuka ulang).
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- dibaca dari URL di client
    setPaymentId(new URLSearchParams(window.location.search).get("bayar"));
  }, []);

  function openPayment(id: string | null) {
    setPaymentId(id);
    window.history.replaceState(null, "", id ? `/qris?bayar=${id}` : "/qris");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-14">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">QRIS Paskatema</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Donasi &amp; Pembayaran</h1>
        <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
          Bayar iuran, kegiatan, atau berdonasi untuk Paskatema dengan aplikasi bank atau e-wallet apa pun yang mendukung QRIS.
        </p>

        {qris.isLoading && <p className="mt-12 text-center text-sm text-slate-400">Memuat QRIS...</p>}
        {qris.isError && <p className="mt-12 text-center text-sm text-rose-600">Gagal memuat QRIS. Coba muat ulang halaman.</p>}
        {qris.isSuccess && !qris.data && (
          <p className="mt-12 rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            QRIS Paskatema belum tersedia. Hubungi bendahara untuk pembayaran.
          </p>
        )}

        {qris.data &&
          (paymentId ? (
            <PaymentView id={paymentId} qris={qris.data} onNew={() => openPayment(null)} />
          ) : (
            <QrisForm qris={qris.data} onPaymentCreated={openPayment} />
          ))}
      </section>
      <Footer />
    </main>
  );
}

function QrisCard({ qris, payload, title, subtitle, fileName }: { qris: QrisSetting; payload: string; title: string; subtitle: string; fileName: string }) {
  return (
    <div className="flex flex-col items-center rounded-[28px] border border-slate-200 bg-white p-6 text-center sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">QRIS</p>
      <p className="mt-1 max-w-[280px] truncate text-sm font-semibold text-slate-900">{qris.merchantName.trim()}</p>
      <div className="mt-4">
        <QrisImage payload={payload} alt={`QRIS ${qris.merchantName}`} />
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-950">{title}</p>
      <p className="text-xs text-slate-400">{subtitle}</p>
      <button
        type="button"
        onClick={() => downloadQris(payload, fileName)}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
      >
        <Download size={15} />
        Unduh QR
      </button>
    </div>
  );
}

function QrisForm({ qris, onPaymentCreated }: { qris: QrisSetting; onPaymentCreated: (id: string) => void }) {
  const { user } = useAuth();
  const [purpose, setPurpose] = useState<Purpose>("donasi");
  const [amountText, setAmountText] = useState("");
  const [payerName, setPayerName] = useState(user?.name ?? "");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Donasi tanpa nominal/kode (QR statis): tidak tercatat otomatis.
  const [showStatic, setShowStatic] = useState(false);

  const amount = Number(amountText.replace(/\D/g, ""));
  const validAmount = Number.isInteger(amount) && amount >= 1_000 && amount <= 10_000_000;
  const staticPayload = useMemo(() => dynamicPayload(qris, null), [qris]);

  const create = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post<PaymentRequest>("/payments", {
          kind: purpose === "donasi" ? "DONASI" : "PEMBAYARAN",
          amount,
          description: description.trim() || undefined,
          payerName: payerName.trim() || undefined,
          payerContact: contact.trim() || undefined,
        })
      ).data,
    onSuccess: (payment) => onPaymentCreated(payment.id),
    onError: (err) => setError(apiErrorMessage(err, "Gagal membuat pembayaran.")),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validAmount) {
      setError("Nominal antara Rp 1.000 dan Rp 10.000.000.");
      return;
    }
    create.mutate();
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto]">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 text-sm font-semibold" role="radiogroup" aria-label="Keperluan">
          {(
            [
              { value: "donasi", label: "Donasi", icon: HeartHandshake },
              { value: "pembayaran", label: "Pembayaran", icon: Wallet },
            ] as const
          ).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={purpose === value}
              onClick={() => setPurpose(value)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 transition ${
                purpose === value ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {purpose === "donasi" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Nama donatur <span className="text-slate-400">(opsional)</span>
              </span>
              <input maxLength={100} value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="Kosong = Anonim" className={inputClass} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Pesan / untuk <span className="text-slate-400">(opsional)</span>
              </span>
              <input
                maxLength={150}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="mis. Untuk LKBB Antareja"
                className={inputClass}
              />
            </label>
          </div>
        )}

        {purpose === "pembayaran" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Nama pembayar</span>
              <input required minLength={2} maxLength={100} value={payerName} onChange={(e) => setPayerName(e.target.value)} className={inputClass} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Kontak <span className="text-slate-400">(opsional)</span>
              </span>
              <input maxLength={100} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="No. WA / angkatan" className={inputClass} />
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Untuk pembayaran apa</span>
              <input
                required
                minLength={3}
                maxLength={150}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="mis. Iuran kas Oktober, kaos angkatan"
                className={inputClass}
              />
            </label>
          </div>
        )}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Nominal {purpose === "donasi" ? "donasi" : "pembayaran"} (Rp)</span>
          <input
            inputMode="numeric"
            value={amountText ? Number(amountText).toLocaleString("id-ID") : ""}
            onChange={(e) => setAmountText(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="mis. 50.000"
            className={`${inputClass} text-lg font-semibold`}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS[purpose].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setAmountText(String(n))}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                amount === n ? "border-rose-600 bg-rose-50 text-rose-600" : "border-slate-200 text-slate-700 hover:border-rose-300"
              }`}
            >
              {rupiah(n)}
            </button>
          ))}
        </div>
        {amountText && !validAmount && <p className="text-sm text-amber-700">Nominal antara Rp 1.000 dan Rp 10.000.000.</p>}

        <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <Info size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <div className="space-y-1">
            <p>
              Sistem menambahkan <b>kode unik</b> (Rp 1–999) ke nominal, mis. Rp 50.000 menjadi Rp 50.123, supaya bendahara bisa
              mengenali {purpose === "donasi" ? "donasi" : "pembayaran"} Anda dan mencatatnya. Bayar <b>tepat</b> sesuai total yang muncul.
            </p>
            {qris.note && <p className="text-slate-500">{qris.note}</p>}
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={create.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-60"
        >
          {create.isPending && <Loader2 size={16} className="animate-spin" />}
          {purpose === "donasi" ? "Buat QR donasi" : "Buat kode pembayaran"}
        </button>

        {purpose === "donasi" && (
          <button
            type="button"
            onClick={() => setShowStatic((v) => !v)}
            className="block text-xs font-semibold text-slate-500 underline-offset-2 hover:text-rose-600 hover:underline"
          >
            {showStatic ? "Sembunyikan QR tanpa nominal" : "Atau pakai QR tanpa nominal (isi sendiri di aplikasi, dicatat manual oleh bendahara)"}
          </button>
        )}
      </form>

      {purpose === "donasi" && showStatic && (
        <QrisCard
          qris={qris}
          payload={staticPayload}
          title="Nominal bebas"
          subtitle="Tidak tercatat otomatis"
          fileName="qris-paskatema.png"
        />
      )}
    </div>
  );
}

function PaymentView({ id, qris, onNew }: { id: string; qris: QrisSetting; onNew: () => void }) {
  const [copied, setCopied] = useState(false);
  const payment = useQuery({
    queryKey: ["payment", id],
    queryFn: async () => (await apiClient.get<PaymentRequest>(`/payments/${id}`)).data,
    retry: false,
    // Cek status tiap 30 detik selama masih menunggu.
    refetchInterval: (q) => (q.state.data?.status === "PENDING" ? 30_000 : false),
  });

  const data = payment.data;
  const status = data ? effectiveStatus(data, payment.dataUpdatedAt) : null;
  const payload = useMemo(() => (data ? dynamicPayload(qris, data.totalAmount) : null), [qris, data]);

  if (payment.isLoading) return <p className="mt-12 text-center text-sm text-slate-400">Memuat pembayaran...</p>;
  if (payment.isError || !data || !payload) {
    return (
      <div className="mt-12 rounded-[24px] border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
        Pembayaran tidak ditemukan.{" "}
        <button onClick={onNew} className="font-semibold text-rose-600 hover:underline">
          Buat pembayaran baru
        </button>
      </div>
    );
  }

  const totalText = rupiah(data.totalAmount);
  const codeText = String(data.uniqueCode).padStart(3, "0");

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto]">
      <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            status === "PAID"
              ? "bg-emerald-50 text-emerald-700"
              : status === "PENDING"
                ? "bg-amber-50 text-amber-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {status && PAYMENT_STATUS_LABEL[status]}
        </span>

        <div>
          <p className="text-sm text-slate-500">Total yang harus dibayar</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-950">
            {/* Sorot 3 digit terakhir hanya bila nominal dasar kelipatan 1.000 (digit = kode unik). */}
            {data.baseAmount % 1000 === 0 ? (
              <>
                {totalText.slice(0, -codeText.length)}
                <span className="rounded-md bg-amber-100 px-1 text-amber-800">{totalText.slice(-codeText.length)}</span>
              </>
            ) : (
              totalText
            )}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {rupiah(data.baseAmount)} + kode unik <b>{data.uniqueCode}</b>. Bayar <b>tepat</b> sejumlah ini.
          </p>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-400">Untuk</dt>
            <dd className="font-medium text-slate-800">{data.description}</dd>
          </div>
          <div>
            <dt className="text-slate-400">{data.kind === "DONASI" ? "Nama donatur" : "Nama pembayar"}</dt>
            <dd className="font-medium text-slate-800">{data.payerName}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Berlaku sampai</dt>
            <dd className="font-medium text-slate-800">
              {new Date(data.expiresAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
            </dd>
          </div>
        </dl>

        {status === "PAID" ? (
          <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            <CheckCircle2 size={18} />
            {data.kind === "DONASI" ? "Donasi sudah diterima bendahara." : "Pembayaran sudah dikonfirmasi bendahara."} Terima kasih!
          </p>
        ) : status === "PENDING" ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Setelah membayar, bendahara akan mengonfirmasi (biasanya dalam 1×24 jam). Halaman ini otomatis menampilkan status
            terbaru. Simpan link halaman ini untuk mengecek lagi.
          </p>
        ) : (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Pembayaran ini {status === "EXPIRED" ? "sudah kedaluwarsa" : "dibatalkan"}. Belum membayar? Buat pembayaran baru. Sudah
            terlanjur membayar? Hubungi bendahara dengan bukti transfer.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
              setCopied(true);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-rose-300 hover:text-rose-600"
          >
            <Copy size={14} />
            {copied ? "Link disalin" : "Salin link halaman ini"}
          </button>
          <button onClick={onNew} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-rose-300">
            Buat pembayaran lain
          </button>
          <Link href="/" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800">
            Beranda
          </Link>
        </div>
      </div>

      {status === "PENDING" && (
        <QrisCard
          qris={qris}
          payload={payload}
          title={totalText}
          subtitle={`Kode unik ${data.uniqueCode}`}
          fileName={`qris-pembayaran-${data.totalAmount}.png`}
        />
      )}
    </div>
  );
}
