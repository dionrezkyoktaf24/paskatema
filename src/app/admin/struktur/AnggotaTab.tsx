"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Loader2, Search } from "lucide-react";

import { apiClient } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Modal } from "@/components/admin/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABEL, type UserRole } from "@/lib/roles";

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  angkatan: number | null;
}

interface MemberListResponse {
  data: MemberItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function AnggotaTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);

  const list = useQuery({
    queryKey: ["admin-members", debouncedSearch, page],
    queryFn: async () =>
      (
        await apiClient.get<MemberListResponse>("/user", {
          params: { search: debouncedSearch || undefined, page, limit: 15 },
        })
      ).data,
  });

  const updateAngkatan = useMutation({
    mutationFn: async ({ id, angkatan }: { id: string; angkatan: number | null }) =>
      (await apiClient.patch(`/user/${id}`, { angkatan })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-members"] }),
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) =>
      (await apiClient.patch(`/user/${id}/role`, { role })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-members"] }),
  });

  const { user: currentUser } = useAuth();
  const [editing, setEditing] = useState<MemberItem | null>(null);
  const [angkatan, setAngkatan] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [formError, setFormError] = useState<string | null>(null);

  function openEdit(item: MemberItem) {
    setAngkatan(item.angkatan?.toString() ?? "");
    setRole(item.role);
    setFormError(null);
    setEditing(item);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!editing) return;

    try {
      await updateAngkatan.mutateAsync({
        id: editing.id,
        angkatan: angkatan ? Number(angkatan) : null,
      });
      if (role !== editing.role) {
        await updateRole.mutateAsync({ id: editing.id, role });
      }
      setEditing(null);
    } catch {
      setFormError("Gagal menyimpan perubahan anggota.");
    }
  }

  const meta = list.data?.meta;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Cari nama atau email..."
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Nama</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Angkatan</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Memuat...
                </td>
              </tr>
            )}
            {list.data?.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Tidak ada anggota ditemukan.
                </td>
              </tr>
            )}
            {list.data?.data.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-5 py-4 font-medium text-slate-900">{item.name}</td>
                <td className="px-5 py-4 text-slate-600">{item.email}</td>
                <td className="px-5 py-4 text-slate-600">
                  {item.angkatan !== null ? `Angkatan ${item.angkatan}` : "—"}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.role === "ADMIN"
                        ? "bg-rose-50 text-rose-700"
                        : item.role === "BENDAHARA"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {ROLE_LABEL[item.role]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      aria-label="Edit anggota"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
            <span>
              Halaman {meta.page} dari {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {editing && (
        <Modal title={`Edit — ${editing.name}`} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Nomor Angkatan</span>
              <input
                type="number"
                min={1}
                placeholder="mis. 32"
                value={angkatan}
                onChange={(e) => setAngkatan(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
              <span className="text-xs text-slate-400">Kosongkan untuk menghapus angkatan.</span>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Role</span>
              <select
                value={role}
                disabled={editing.id === currentUser?.id}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="USER">Anggota</option>
                <option value="BENDAHARA">Bendahara — mencatat laporan keuangan</option>
                <option value="ADMIN">Admin — kelola seluruh panel</option>
              </select>
              {editing.id === currentUser?.id && (
                <span className="text-xs text-slate-400">Role akun sendiri tidak bisa diubah.</span>
              )}
            </label>

            {formError && <p className="text-sm text-rose-600">{formError}</p>}

            <button
              type="submit"
              disabled={updateAngkatan.isPending || updateRole.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {(updateAngkatan.isPending || updateRole.isPending) && <Loader2 size={16} className="animate-spin" />}
              Simpan
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
