"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/contexts/AuthContext";
import { Modal } from "@/components/admin/Modal";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { rupiah } from "@/services/payment";
import type { MediaItem } from "@/services/media";
import type { Product } from "@/services/product";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

export default function AdminMerchandisePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await apiClient.get<Product[]>("/products/manage")).data,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["public-products"] });
  };

  const remove = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/products/${id}`),
    onSuccess: invalidate,
    onError: (err) => setError(apiErrorMessage(err, "Gagal menghapus produk.")),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Merchandise</h1>
          <p className="text-sm text-slate-500">
            Produk tampil di halaman /merchandise. Pembelian dibayar lewat QRIS berkode unik; konfirmasi di Laporan Keuangan →
            Pembayaran QRIS (stok berkurang saat dikonfirmasi).
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
        >
          <Plus size={16} />
          Tambah Produk
        </button>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {products.isLoading && <p className="text-sm text-slate-400">Memuat...</p>}
      {products.data?.length === 0 && (
        <p className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">Belum ada produk.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.data?.map((p) => (
          <div key={p.id} className={`flex gap-4 rounded-[20px] border border-slate-200 bg-white p-4 ${p.isActive ? "" : "opacity-60"}`}>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <ShoppingBag size={24} className="text-slate-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{p.name}</p>
              <p className="text-sm text-rose-600">{rupiah(p.price)}</p>
              <p className="text-xs text-slate-500">
                {p.stock === null ? "Stok bebas" : `Stok ${p.stock}`}
                {p.options.length > 0 && ` · ${p.options.join("/")}`}
                {!p.isActive && " · disembunyikan"}
              </p>
              <div className="mt-2 flex gap-1">
                <button onClick={() => setEditing(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800" aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    if (window.confirm(`Hapus produk "${p.name}"? Riwayat pembayarannya tetap tersimpan.`)) remove.mutate(p.id);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Hapus"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ProductForm
          product={editing === "new" ? null : editing}
          allowGallery={user?.role === "ADMIN"}
          onClose={() => setEditing(null)}
          onSaved={() => {
            invalidate();
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  allowGallery,
  onClose,
  onSaved,
}: {
  product: Product | null;
  allowGallery: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(product?.stock != null ? String(product.stock) : "");
  const [options, setOptions] = useState(product?.options.join(", ") ?? "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [image, setImage] = useState<MediaItem | null>(product?.image ? ({ ...product.image, size: 0, createdAt: "" } as MediaItem) : null);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const body = {
        name,
        description: description.trim() || null,
        price: Number(price),
        stock: stock === "" ? null : Number(stock),
        options: options
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean),
        isActive,
        imageId: image?.id ?? null,
      };
      return product
        ? (await apiClient.patch(`/products/${product.id}`, body)).data
        : (await apiClient.post("/products", body)).data;
    },
    onSuccess: onSaved,
    onError: (err) => setError(apiErrorMessage(err, "Gagal menyimpan produk.")),
  });

  return (
    <Modal title={product ? "Edit Produk" : "Tambah Produk"} onClose={onClose}>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          setError(null);
          save.mutate();
        }}
        className="space-y-4"
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Nama produk</span>
          <input required minLength={2} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Kaos Paskatema 2026" className={inputClass} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Harga (Rp)</span>
            <input required type="number" min={1000} step={1} value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Stok</span>
            <input type="number" min={0} step={1} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Kosong = bebas" className={inputClass} />
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Pilihan (opsional)</span>
          <input value={options} onChange={(e) => setOptions(e.target.value)} placeholder="Pisahkan dengan koma, mis. S, M, L, XL" className={inputClass} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Deskripsi (opsional)</span>
          <textarea rows={3} maxLength={3000} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
        </label>
        <MediaPicker label="Foto produk" value={image} onChange={setImage} accept="image/*" allowGallery={allowGallery} />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-rose-600" />
          Tampilkan di halaman merchandise
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={save.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
        >
          {save.isPending && <Loader2 size={16} className="animate-spin" />}
          Simpan
        </button>
      </form>
    </Modal>
  );
}
