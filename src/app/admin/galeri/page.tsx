"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";

import { useCrudResource } from "@/hooks/useCrudResource";
import { Modal } from "@/components/admin/Modal";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { MediaItem } from "@/services/media";
import type { GalleryPhoto } from "@/services/gallery";

interface GalleryFormValues {
  angkatan: number;
  caption?: string;
  imageId: string;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

export default function AdminGaleriPage() {
  const { list, create, remove } = useCrudResource<
    GalleryPhoto,
    GalleryFormValues,
    Partial<GalleryFormValues>
  >("admin-gallery", "/gallery");

  const [filter, setFilter] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [angkatan, setAngkatan] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<MediaItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const angkatanOptions = Array.from(new Set(list.data?.map((p) => p.angkatan) ?? [])).sort(
    (a, b) => b - a,
  );
  const items = (list.data ?? []).filter((p) => filter == null || p.angkatan === filter);

  function openCreate() {
    setAngkatan(filter?.toString() ?? "");
    setCaption("");
    setImage(null);
    setFormError(null);
    setIsOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!image) {
      setFormError("Pilih atau unggah foto terlebih dahulu.");
      return;
    }
    try {
      await create.mutateAsync({
        angkatan: Number(angkatan),
        caption: caption.trim() || undefined,
        imageId: image.id,
      });
      setIsOpen(false);
    } catch {
      setFormError("Gagal menyimpan foto. Periksa kembali isian Anda.");
    }
  }

  async function handleDelete(photo: GalleryPhoto) {
    if (!window.confirm("Hapus foto ini dari galeri?")) return;
    await remove.mutateAsync(photo.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Galeri</h1>
          <p className="text-sm text-slate-500">
            Foto per angkatan. Anggota juga dapat menambah foto angkatannya sendiri dari halaman
            Akun; di sini admin dapat menambah untuk angkatan mana pun dan menghapus foto yang
            tidak pantas.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
        >
          <Plus size={16} />
          Tambah Foto
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
            filter == null
              ? "border-rose-600 bg-rose-600 text-white"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          Semua
        </button>
        {angkatanOptions.map((a) => (
          <button
            key={a}
            onClick={() => setFilter(a)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              filter === a
                ? "border-rose-600 bg-rose-600 text-white"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            Angkatan {a}
          </button>
        ))}
      </div>

      {list.isLoading && <p className="text-sm text-slate-400">Memuat...</p>}
      {list.isSuccess && items.length === 0 && (
        <p className="rounded-[24px] border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-400">
          Belum ada foto.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {items.map((photo) => (
          <div
            key={photo.id}
            className="overflow-hidden rounded-[20px] border border-slate-200 bg-white"
          >
            <div className="relative aspect-square bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.image.url}
                alt={photo.caption ?? ""}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => handleDelete(photo)}
                aria-label="Hapus"
                className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-slate-600 shadow transition hover:text-rose-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="space-y-0.5 p-3 text-xs">
              <p className="font-semibold text-slate-900">Angkatan {photo.angkatan}</p>
              {photo.caption && <p className="truncate text-slate-600">{photo.caption}</p>}
              <p className="truncate text-slate-400">
                {photo.uploader ? `oleh ${photo.uploader.name}` : "pengunggah dihapus"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <Modal title="Tambah Foto Galeri" onClose={() => setIsOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Angkatan</span>
              <input
                required
                type="number"
                min={1}
                max={999}
                value={angkatan}
                onChange={(e) => setAngkatan(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Keterangan (opsional)</span>
              <input
                maxLength={300}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className={inputClass}
              />
            </label>

            <MediaPicker label="Foto" value={image} onChange={setImage} />

            {formError && <p className="text-sm text-rose-600">{formError}</p>}

            <button
              type="submit"
              disabled={create.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {create.isPending && <Loader2 size={16} className="animate-spin" />}
              Simpan
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
