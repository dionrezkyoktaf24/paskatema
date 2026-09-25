"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Power, Trash2, X } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { Modal } from "@/components/admin/Modal";
import { FIELD_TYPES, type FieldType, type FormField, type FormSetting } from "@/services/organisasi";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:bg-slate-50 disabled:text-slate-400";

/** Field di editor. `key` kosong = pertanyaan baru; key dibuat dari label saat disimpan. */
interface DraftField {
  uid: number;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  optionsText: string;
}

const DEFAULT_FIELDS: Omit<FormField, "key">[] = [
  { label: "Nama Lengkap", type: "text", required: true },
  { label: "Nomor Induk Siswa (NIS)", type: "text", required: true },
  { label: "Kelas", type: "select", required: true, options: ["X RPL 1", "X RPL 2", "X TKJ 1", "X TKJ 2"] },
  { label: "No. WhatsApp", type: "tel", required: true },
  { label: "Alasan Bergabung PASKATEMA", type: "textarea", required: true },
];

let uidCounter = 0;
const nextUid = () => ++uidCounter;

function toDraft(field: Omit<FormField, "key"> & { key?: string }): DraftField {
  return {
    uid: nextUid(),
    key: field.key ?? "",
    label: field.label,
    type: field.type,
    required: field.required,
    optionsText: (field.options ?? []).join("\n"),
  };
}

function slugKey(label: string): string {
  const base = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  if (!base) return "pertanyaan";
  return /^[a-z]/.test(base) ? base : `f_${base}`;
}

/** Ubah draft jadi schema; key baru dibuat unik dari label. */
function toSchema(drafts: DraftField[]): FormField[] {
  const used = new Set(drafts.filter((d) => d.key).map((d) => d.key));
  return drafts.map((d) => {
    let key = d.key;
    if (!key) {
      const base = slugKey(d.label);
      key = base;
      for (let i = 2; used.has(key); i++) key = `${base}_${i}`;
      used.add(key);
    }
    const field: FormField = { key, label: d.label.trim(), type: d.type, required: d.required };
    if (d.type === "select") {
      field.options = d.optionsText
        .split("\n")
        .map((o) => o.trim())
        .filter(Boolean);
    }
    return field;
  });
}

export function FormulirTab() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<FormSetting | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const forms = useQuery({
    queryKey: ["admin-form-setting"],
    queryFn: async () => (await apiClient.get<FormSetting[]>("/form-setting")).data,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-form-setting"] });
    queryClient.invalidateQueries({ queryKey: ["form-active"] });
  };

  const toggle = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await apiClient.patch(`/form-setting/${id}/status`, { isActive })).data,
    onSuccess: invalidate,
    onError: (err) => setError(apiErrorMessage(err, "Gagal mengubah status formulir.")),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/form-setting/${id}`),
    onSuccess: invalidate,
    onError: (err) => setError(apiErrorMessage(err, "Gagal menghapus formulir.")),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Hanya satu formulir yang bisa aktif. Formulir aktif tampil di halaman <b>/pendaftaran</b>.
        </p>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
        >
          <Plus size={16} />
          Formulir Baru
        </button>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {forms.isLoading && <p className="text-sm text-slate-400">Memuat...</p>}
        {forms.data?.length === 0 && (
          <p className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400 lg:col-span-2">
            Belum ada formulir. Buat formulir baru untuk membuka pendaftaran.
          </p>
        )}
        {forms.data?.map((form) => {
          const count = form._count?.registrations ?? 0;
          return (
            <div key={form.id} className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{form.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {form.schema.length} pertanyaan · {count} pendaftar
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    form.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {form.isActive ? "Dibuka" : "Ditutup"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setError(null);
                    toggle.mutate({ id: form.id, isActive: !form.isActive });
                  }}
                  disabled={toggle.isPending}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                    form.isActive
                      ? "border border-slate-200 text-slate-700 hover:border-slate-300"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  <Power size={13} />
                  {form.isActive ? "Tutup pendaftaran" : "Buka pendaftaran"}
                </button>
                <button
                  onClick={() => setEditing(form)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
                >
                  <Pencil size={13} />
                  Edit
                </button>
                {count === 0 && (
                  <button
                    onClick={() => {
                      setError(null);
                      if (window.confirm(`Hapus formulir "${form.title}"?`)) remove.mutate(form.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={13} />
                    Hapus
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <FormEditor
          form={editing === "new" ? null : editing}
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

function FormEditor({
  form,
  onClose,
  onSaved,
}: {
  form: FormSetting | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  // Schema tidak bisa diubah bila sudah ada pendaftar (jawaban lama bergantung padanya).
  const locked = (form?._count?.registrations ?? 0) > 0;
  const [title, setTitle] = useState(form?.title ?? "");
  const [fields, setFields] = useState<DraftField[]>(() =>
    (form ? form.schema : DEFAULT_FIELDS).map((f) => toDraft(f)),
  );
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const body = locked ? { title } : { title, schema: toSchema(fields) };
      return form
        ? (await apiClient.patch(`/form-setting/${form.id}`, body)).data
        : (await apiClient.post("/form-setting", body)).data;
    },
    onSuccess: onSaved,
    onError: (err) => setError(apiErrorMessage(err, "Gagal menyimpan formulir.")),
  });

  function patch(uid: number, changes: Partial<DraftField>) {
    setFields((prev) => prev.map((f) => (f.uid === uid ? { ...f, ...changes } : f)));
  }

  function move(index: number, delta: number) {
    setFields((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!locked && fields.length === 0) {
      setError("Tambahkan minimal satu pertanyaan.");
      return;
    }
    save.mutate();
  }

  return (
    <Modal title={form ? "Edit Formulir" : "Formulir Baru"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Judul</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="mis. Rekrutmen Angkatan 33"
            className={inputClass}
          />
        </label>

        {locked && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Formulir ini sudah punya pendaftar, jadi pertanyaannya tidak bisa diubah. Buat formulir baru untuk pertanyaan yang berbeda.
          </p>
        )}

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Pertanyaan</p>
          {fields.map((field, index) => (
            <div key={field.uid} className="space-y-2 rounded-2xl border border-slate-200 p-3">
              <div className="flex gap-2">
                <input
                  required
                  disabled={locked}
                  value={field.label}
                  onChange={(e) => patch(field.uid, { label: e.target.value })}
                  placeholder="Pertanyaan"
                  className={inputClass}
                />
                {!locked && (
                  <div className="flex shrink-0 items-center">
                    <button type="button" onClick={() => move(index, -1)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Naikkan">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" onClick={() => move(index, 1)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Turunkan">
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFields((prev) => prev.filter((f) => f.uid !== field.uid))}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Hapus pertanyaan"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  disabled={locked}
                  value={field.type}
                  onChange={(e) => patch(field.uid, { type: e.target.value as FieldType })}
                  className={`${inputClass} w-auto`}
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    disabled={locked}
                    checked={field.required}
                    onChange={(e) => patch(field.uid, { required: e.target.checked })}
                    className="h-4 w-4 accent-rose-600"
                  />
                  Wajib diisi
                </label>
              </div>
              {field.type === "select" && (
                <textarea
                  required
                  disabled={locked}
                  rows={3}
                  value={field.optionsText}
                  onChange={(e) => patch(field.uid, { optionsText: e.target.value })}
                  placeholder={"Satu pilihan per baris\nX RPL 1\nX RPL 2"}
                  className={inputClass}
                />
              )}
            </div>
          ))}
          {!locked && (
            <button
              type="button"
              onClick={() =>
                setFields((prev) => [...prev, toDraft({ label: "", type: "text", required: false })])
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
            >
              <Plus size={15} />
              Tambah pertanyaan
            </button>
          )}
        </div>

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
