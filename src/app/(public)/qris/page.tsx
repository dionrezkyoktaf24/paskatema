"use client";

import { useMemo, useState } from "react";
import { Download, HeartHandshake, Info, Wallet } from "lucide-react";

import { Footer } from "@/components/footer/Footer";
import { QrisImage, downloadQris } from "@/components/qris/QrisImage";
import { toDynamicQris } from "@/lib/qris";
import { useQris } from "@/services/qris";

type Purpose = "donasi" | "pembayaran";

const PRESETS: Record<Purpose, number[]> = {
  donasi: [10_000, 25_000, 50_000, 100_000],
  pembayaran: [10_000, 20_000, 50_000, 100_000],
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function QrisPage() {
  const qris = useQris();
  const [purpose, setPurpose] = useState<Purpose>("donasi");
  const [amountText, setAmountText] = useState("");

  const amount = Number(amountText.replace(/\D/g, ""));
  const validAmount = Number.isInteger(amount) && amount >= 1_000 && amount <= 10_000_000;

  // QRIS dinamis (nominal terisi) bila nominal valid; selain itu QRIS statis.
  const payload = useMemo(() => {
    if (!qris.data) return null;
    if (!validAmount) return qris.data.payload;
    try {
      return toDynamicQris(qris.data.payload, amount);
    } catch {
      return qris.data.payload;
    }
  }, [qris.data, validAmount, amount]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-14">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">QRIS Paskatema</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Donasi &amp; Pembayaran</h1>
        <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
          Bayar iuran, kegiatan, atau berdonasi untuk Paskatema dengan aplikasi bank atau e-wallet apa pun yang mendukung QRIS.
        </p>

        {qris.isLoading && <p className="mt-12 text-center text-sm text-slate-400">Memuat QRIS...</p>}
        {qris.isError && (
          <p className="mt-12 text-center text-sm text-rose-600">Gagal memuat QRIS. Coba muat ulang halaman.</p>
        )}
        {qris.isSuccess && !qris.data && (
          <p className="mt-12 rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            QRIS Paskatema belum tersedia. Hubungi bendahara untuk pembayaran.
          </p>
        )}

        {qris.data && payload && (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto]">
            <div className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8">
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

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Nominal {purpose === "donasi" ? "donasi" : "pembayaran"} (Rp)
                </span>
                <input
                  inputMode="numeric"
                  value={amountText ? Number(amountText.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                  onChange={(e) => setAmountText(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="mis. 50.000"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg font-semibold outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
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
              {amountText && !validAmount && (
                <p className="text-sm text-amber-700">Nominal antara Rp 1.000 dan Rp 10.000.000.</p>
              )}

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <Info size={18} className="mt-0.5 shrink-0 text-slate-400" />
                <div className="space-y-1">
                  <p>1. Isi nominal, lalu pindai QR dengan aplikasi bank/e-wallet. Nominal sudah terisi otomatis.</p>
                  <p>2. Pastikan nama penerima <b>{qris.data.merchantName.trim()}</b>.</p>
                  <p>
                    3. Simpan bukti pembayaran dan kirim ke bendahara
                    {purpose === "pembayaran" ? " beserta keterangan pembayarannya (mis. iuran bulan apa)." : "."}
                  </p>
                  {qris.data.note && <p className="pt-1 text-slate-500">{qris.data.note}</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center rounded-[28px] border border-slate-200 bg-white p-6 text-center sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">QRIS</p>
              <p className="mt-1 max-w-[280px] truncate text-sm font-semibold text-slate-900">{qris.data.merchantName.trim()}</p>
              <div className="mt-4">
                <QrisImage payload={payload} alt={`QRIS ${qris.data.merchantName}`} />
              </div>
              <p className="mt-4 text-2xl font-semibold text-slate-950">{validAmount ? rupiah(amount) : "Nominal bebas"}</p>
              <p className="text-xs text-slate-400">{validAmount ? (purpose === "donasi" ? "Donasi" : "Pembayaran") : "Isi nominal di aplikasi saat membayar"}</p>
              <button
                type="button"
                onClick={() => downloadQris(payload, validAmount ? `qris-paskatema-${amount}.png` : "qris-paskatema.png")}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
              >
                <Download size={15} />
                Unduh QR
              </button>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
