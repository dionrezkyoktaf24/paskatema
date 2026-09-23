"use client";

import { useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, Loader2, CheckCircle2 } from "lucide-react";

import { useCrudResource } from "@/hooks/useCrudResource";
import { Modal } from "@/components/admin/Modal";

interface PeriodItem {
  id: string;
  name: string;
  isActive: boolean;
}

interface PeriodFormValues {
  name: string;
  isActive?: boolean;
}

export function PeriodeTab() {
  const { list, create, update, remove } = useCrudResource<
    PeriodItem,
    PeriodFormValues,
    PeriodFormValues
  >("admin-period", "/period");

  const [editing, setEditing] = useState<PeriodItem | null | "new">(null);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreate() {
    setName("");
    setIsActive(false);
    setFormError(null);
    setEditing("new");
  }

  function openEdit(item: PeriodItem) {
    setName(item.name);
    setIsActive(item.isActive);
    setFormError(null);
    setEditing(item);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    try {
      if (editing === "new") {
        await create.mutateAsync({ name, isActive });
      } else if (editing) {
        await update.mutateAsync({ id: editing.id, data: { name, isActive } });
      }
      setEditing(null);
    } catch {
      setFormError("Gagal menyimpan periode.");
    }
  }

  async function handleDelete(item: PeriodItem) {
    if (!window.confirm(`Hapus periode "${item.name}"?`)) return;
    await remove.mutateAsync(item.id);
  }

  const isSaving = create.isPending || update.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Periode kepengurusan Paskatema.</p>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
        >
          <Plus size={16} />
          Tambah Periode
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Nama Periode</th>
              <th className="px-5 py-3">Status</th>
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
                  Belum ada periode.
                </td>
              </tr>
            )}
            {list.data?.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-5 py-4 font-medium text-slate-900">{item.name}</td>
                <td className="px-5 py-4">
                  {item.isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={13} />
                      Aktif
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                      Nonaktif
                    </span>
                  )}
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
        <Modal title={editing === "new" ? "Tambah Periode" : "Edit Periode"} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Nama Periode</span>
              <input
                required
                placeholder="mis. 2025/2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>

            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-sm text-slate-700">Jadikan periode aktif</span>
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
