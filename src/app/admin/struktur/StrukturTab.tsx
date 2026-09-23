"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

import { apiClient } from "@/lib/api";
import { useCrudResource } from "@/hooks/useCrudResource";
import { Modal } from "@/components/admin/Modal";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { UserPicker, type UserOption } from "@/components/admin/UserPicker";
import type { MediaItem } from "@/services/media";

interface StructureItem {
  id: string;
  user: UserOption;
  position: { id: string; name: string; level: number };
  period: { id: string; name: string };
  image: MediaItem | null;
}

interface StructureFormValues {
  userId: string;
  positionId: string;
  periodId: string;
  imageId?: string;
}

interface PeriodOption {
  id: string;
  name: string;
}

interface PositionOption {
  id: string;
  name: string;
  level: number;
}

export function StrukturTab() {
  const { list, create, update, remove } = useCrudResource<
    StructureItem,
    StructureFormValues,
    StructureFormValues
  >("admin-structure", "/structure");

  const periods = useQuery({
    queryKey: ["periods-for-select"],
    queryFn: async () => (await apiClient.get<PeriodOption[]>("/period")).data,
  });

  const positions = useQuery({
    queryKey: ["positions-for-select"],
    queryFn: async () => (await apiClient.get<PositionOption[]>("/position")).data,
  });

  const [editing, setEditing] = useState<StructureItem | null | "new">(null);
  const [user, setUser] = useState<UserOption | null>(null);
  const [positionId, setPositionId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [image, setImage] = useState<MediaItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreate() {
    setUser(null);
    setPositionId("");
    setPeriodId("");
    setImage(null);
    setFormError(null);
    setEditing("new");
  }

  function openEdit(item: StructureItem) {
    setUser(item.user);
    setPositionId(item.position.id);
    setPeriodId(item.period.id);
    setImage(item.image);
    setFormError(null);
    setEditing(item);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!user) {
      setFormError("Pilih anggota terlebih dahulu.");
      return;
    }

    const payload: StructureFormValues = {
      userId: user.id,
      positionId,
      periodId,
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
      setFormError(
        "Gagal menyimpan. Kemungkinan anggota ini sudah punya jabatan di periode tersebut.",
      );
    }
  }

  async function handleDelete(item: StructureItem) {
    if (!window.confirm(`Hapus ${item.user.name} dari struktur ${item.period.name}?`)) return;
    await remove.mutateAsync(item.id);
  }

  const isSaving = create.isPending || update.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Penempatan anggota ke jabatan per periode kepengurusan.</p>
        <button
          onClick={openCreate}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
        >
          <Plus size={16} />
          Tambah Penempatan
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Anggota</th>
              <th className="px-5 py-3">Jabatan</th>
              <th className="px-5 py-3">Periode</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.isLoading && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  Memuat...
                </td>
              </tr>
            )}
            {list.data?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  Belum ada penempatan struktur.
                </td>
              </tr>
            )}
            {list.data?.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-5 py-4 font-medium text-slate-900">{item.user.name}</td>
                <td className="px-5 py-4 text-slate-600">{item.position.name}</td>
                <td className="px-5 py-4 text-slate-600">{item.period.name}</td>
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
          title={editing === "new" ? "Tambah Penempatan" : "Edit Penempatan"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <UserPicker label="Anggota" value={user} onChange={setUser} />

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Jabatan</span>
                <select
                  required
                  value={positionId}
                  onChange={(e) => setPositionId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                >
                  <option value="" disabled>
                    Pilih jabatan
                  </option>
                  {positions.data?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Periode</span>
                <select
                  required
                  value={periodId}
                  onChange={(e) => setPeriodId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                >
                  <option value="" disabled>
                    Pilih periode
                  </option>
                  {periods.data?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <MediaPicker label="Foto (opsional)" value={image} onChange={setImage} />

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
