"use client";

import { useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

import { useCrudResource } from "@/hooks/useCrudResource";
import { Modal } from "@/components/admin/Modal";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { MediaItem } from "@/services/media";

interface EbookItem {
  id: string;
  title: string;
  description: string | null;
  fileId: string;
  file: MediaItem;
}

interface EbookFormValues {
  title: string;
  description?: string;
  fileId: string;
}

export default function AdminEbookPage() {
  const { list, create, update, remove } = useCrudResource<
    EbookItem,
    EbookFormValues,
    EbookFormValues
  >("admin-ebook", "/ebook");

  const [editing, setEditing] = useState<EbookItem | null | "new">(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<MediaItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreate() {
    setTitle("");
    setDescription("");
    setFile(null);
    setFormError(null);
    setEditing("new");
  }

  function openEdit(item: EbookItem) {
    setTitle(item.title);
    setDescription(item.description ?? "");
    setFile(item.file);
    setFormError(null);
    setEditing(item);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!file) {
      setFormError("File e-book wajib diunggah.");
      return;
    }

    const payload: EbookFormValues = {
      title,
      description: description || undefined,
      fileId: file.id,
    };

    try {
      if (editing === "new") {
        await create.mutateAsync(payload);
      } else if (editing) {
        await update.mutateAsync({ id: editing.id, data: payload });
      }
      setEditing(null);
    } catch {
      setFormError("Gagal menyimpan e-book. Periksa kembali isian Anda.");
    }
  }

  async function handleDelete(item: EbookItem) {
    if (!window.confirm(`Hapus e-book "${item.title}"?`)) return;
    await remove.mutateAsync(item.id);
  }

  const isSaving = create.isPending || update.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">E-Book</h1>
          <p className="text-sm text-slate-500">Kelola materi &amp; peraturan elektronik.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
        >
          <Plus size={16} />
          Tambah E-Book
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Judul</th>
              <th className="px-5 py-3">File</th>
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
                  Belum ada e-book.
                </td>
              </tr>
            )}
            {list.data?.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="max-w-sm truncate px-5 py-4 font-medium text-slate-900">
                  {item.title}
                </td>
                <td className="max-w-xs truncate px-5 py-4 text-slate-600">
                  {item.file?.fileName ?? "—"}
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
        </table>
      </div>

      {editing && (
        <Modal title={editing === "new" ? "Tambah E-Book" : "Edit E-Book"} onClose={() => setEditing(null)}>
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
              <span className="text-sm font-medium text-slate-700">Deskripsi (opsional)</span>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>

            <MediaPicker label="File E-Book" value={file} onChange={setFile} />

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
