"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Minus, Plus, ShoppingBag } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/footer/Footer";
import { Modal } from "@/components/admin/Modal";
import { useQris } from "@/services/qris";
import { rupiah, type PaymentRequest } from "@/services/payment";
import type { Product } from "@/services/product";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

export default function MerchandisePage() {
  const products = useQuery({
    queryKey: ["public-products"],
    queryFn: async () => (await apiClient.get<Product[]>("/products")).data,
  });
  const qris = useQris();
  const [buying, setBuying] = useState<Product | null>(null);

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-14 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">Merchandise</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Merchandise Resmi Paskatema</h1>
        <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
          Dukung kegiatan Paskatema lewat merchandise resmi. Pembayaran dengan QRIS; konfirmasi oleh bendahara.
        </p>

        {products.isLoading && <p className="mt-12 text-center text-sm text-slate-400">Memuat produk...</p>}
        {products.isError && <p className="mt-12 text-center text-sm text-rose-600">Gagal memuat produk.</p>}
        {products.isSuccess && products.data.length === 0 && (
          <p className="mt-12 text-center text-sm text-slate-400">Belum ada merchandise yang dijual.</p>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.data?.map((p) => {
            const soldOut = p.stock !== null && p.stock <= 0;
            return (
              <article key={p.id} className="flex flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <div className="flex aspect-square items-center justify-center bg-slate-100">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image.url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <ShoppingBag size={44} className="text-slate-300" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h2 className="text-lg font-semibold text-slate-950">{p.name}</h2>
                  <p className="text-xl font-semibold text-rose-600">{rupiah(p.price)}</p>
                  {p.options.length > 0 && <p className="text-xs text-slate-500">Pilihan: {p.options.join(", ")}</p>}
                  {p.description && <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{p.description}</p>}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-xs text-slate-400">
                      {p.stock === null ? "Tersedia" : soldOut ? "Stok habis" : `Sisa ${p.stock}`}
                    </span>
                    <button
                      onClick={() => setBuying(p)}
                      disabled={soldOut || !qris.data}
                      className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-40"
                    >
                      {soldOut ? "Habis" : "Beli"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {products.data && products.data.length > 0 && qris.isSuccess && !qris.data && (
          <p className="mt-6 text-center text-sm text-slate-500">Pembelian dibuka setelah bendahara mengatur QRIS Paskatema.</p>
        )}
      </section>

      {buying && <BuyModal product={buying} onClose={() => setBuying(null)} />}
      <Footer />
    </main>
  );
}

function BuyModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [option, setOption] = useState(product.options[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [payerName, setPayerName] = useState(user?.name ?? "");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const maxQty = Math.min(50, product.stock ?? 50);

  const order = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post<PaymentRequest>("/payments", {
          productId: product.id,
          quantity,
          productOption: option || undefined,
          payerName: payerName.trim(),
          payerContact: contact.trim(),
        })
      ).data,
    onSuccess: (payment) => router.push(`/qris?bayar=${payment.id}`),
    onError: (err) => setError(apiErrorMessage(err, "Gagal membuat pesanan.")),
  });

  return (
    <Modal title={`Beli ${product.name}`} onClose={onClose}>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          setError(null);
          order.mutate();
        }}
        className="space-y-4"
      >
        {product.options.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Pilihan</span>
            <div className="flex flex-wrap gap-2">
              {product.options.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOption(o)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    option === o ? "border-rose-600 bg-rose-50 text-rose-600" : "border-slate-200 text-slate-700 hover:border-rose-300"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Jumlah</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Kurangi"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center font-semibold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Tambah"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Nama pemesan</span>
          <input required minLength={2} maxLength={100} value={payerName} onChange={(e) => setPayerName(e.target.value)} className={inputClass} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">No. WhatsApp</span>
          <input
            required
            type="tel"
            maxLength={100}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Untuk konfirmasi & pengambilan barang"
            className={inputClass}
          />
        </label>
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-sm text-slate-600">Subtotal</span>
          <span className="text-lg font-semibold text-slate-950">{rupiah(product.price * quantity)}</span>
        </div>
        <p className="text-xs text-slate-400">Total akhir ditambah kode unik Rp 1–999 untuk memudahkan konfirmasi pembayaran.</p>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={order.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
        >
          {order.isPending && <Loader2 size={16} className="animate-spin" />}
          Lanjut ke pembayaran QRIS
        </button>
      </form>
    </Modal>
  );
}
