"use client";

import { useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

import { useCrudResource } from "@/hooks/useCrudResource";
import { Modal } from "@/components/admin/Modal";

interface PositionItem {
  id: string;
  name: string;
  level: number;
}

interface PositionFormValues {
  name: string;
  level: number;
}

export function JabatanTab() {
  const { list, create, update, remove } = useCrudResource<
    PositionItem,
    PositionFormValues,
    PositionFormValues
  >("admin-position", "/position");

  const [editing, setEditing] = useState<PositionItem | null | "new">(null);
  const [name, setName] = useState("");
  const [level, setLevel] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreate() {
    setName("");
    setLevel(1);
    setFormError(null);
    setEditing("new");
  }

  function openEdit(item: PositionItem) {
    setName(item.name);
    setLevel(item.level);
    setFormError(null);
    setEditing(item);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    try {
      if (editing === "new") {
        await create.mutateAsync({ name, level });
      } else if (editing) {
        await update.mutateAsync({ id: editing.id, data: { name, level } });
      }
      setEditing(null);
    } catch {
      setFormError("Gagal menyimpan jabatan.");
    }
  }

  async function handleDelete(item: PositionItem) {
    if (!window.confirm(`Hapus jabatan "${item.name}"?`)) return;
    await remove.mutateAsync(item.id);
  }

  const isSaving = create.isPending || update.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Daftar jabatan (mis. Pembina, Pelatih, Komandan, Wakil Komandan). Level menentukan urutan hierarki (1 = tertinggi).
        </p>
        <button
          onClick={openCreate}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
        >
          <Plus size={16} />
          Tambah Jabatan
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Level</th>
              <th className="px-5 py-3">Nama Jabatan</th>
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
                  Belum ada jabatan.
                </td>
              </tr>
            )}
            {list.data?.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-5 py-4 text-slate-500">{item.level}</td>
                <td className="px-5 py-4 font-medium text-slate-900">{item.name}</td>
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
        <Modal title={editing === "new" ? "Tambah Jabatan" : "Edit Jabatan"} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Nama Jabatan</span>
              <input
                required
                placeholder="mis. Pelatih"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Level (1 = tertinggi)</span>
              <input
                required
                type="number"
                min={1}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>

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
