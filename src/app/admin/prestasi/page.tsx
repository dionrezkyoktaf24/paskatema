"use client";

import { useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

import { useCrudResource } from "@/hooks/useCrudResource";
import { Modal } from "@/components/admin/Modal";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { MediaItem } from "@/services/media";

interface AchievementItem {
  id: string;
  title: string;
  year: number;
  description: string | null;
  imageId: string | null;
  image: MediaItem | null;
}

interface AchievementFormValues {
  title: string;
  year: number;
  description?: string;
  imageId?: string;
}

export default function AdminPrestasiPage() {
  const { list, create, update, remove } = useCrudResource<
    AchievementItem,
    AchievementFormValues,
    AchievementFormValues
  >("admin-achievement", "/achievement");

  const [editing, setEditing] = useState<AchievementItem | null | "new">(null);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<MediaItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreate() {
    setTitle("");
    setYear(new Date().getFullYear());
    setDescription("");
    setImage(null);
    setFormError(null);
    setEditing("new");
  }

  function openEdit(item: AchievementItem) {
    setTitle(item.title);
    setYear(item.year);
    setDescription(item.description ?? "");
    setImage(item.image);
    setFormError(null);
    setEditing(item);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const payload: AchievementFormValues = {
      title,
      year,
      description: description || undefined,
      imageId: image?.id,
    };

    try {
      if (editing === "new") {
        await create.mutateAsync(payload);
      } else if (editing) {
        await update.mutateAsync({ id: editing.id, data: payload });
      }
      setEditing(null);
    } catch {
      setFormError("Gagal menyimpan prestasi. Periksa kembali isian Anda.");
    }
  }

  async function handleDelete(item: AchievementItem) {
    if (!window.confirm(`Hapus prestasi "${item.title}"?`)) return;
    await remove.mutateAsync(item.id);
  }

  const isSaving = create.isPending || update.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Prestasi</h1>
          <p className="text-sm text-slate-500">Kelola riwayat prestasi &amp; lomba Paskatema.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
        >
          <Plus size={16} />
          Tambah Prestasi
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Judul</th>
              <th className="px-5 py-3">Tahun</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.isLoading && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                  Memuat...
                </td>
              </tr>
            )}
            {list.data?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                  Belum ada prestasi.
                </td>
              </tr>
            )}
            {list.data?.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="max-w-sm truncate px-5 py-4 font-medium text-slate-900">
                  {item.title}
                </td>
                <td className="px-5 py-4 text-slate-600">{item.year}</td>
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
        </table>
      </div>

      {editing && (
        <Modal
          title={editing === "new" ? "Tambah Prestasi" : "Edit Prestasi"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Judul</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Tahun</span>
              <input
                required
                type="number"
                min={1900}
                max={2100}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Deskripsi (opsional)</span>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>

            <MediaPicker label="Gambar (opsional)" value={image} onChange={setImage} />

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
