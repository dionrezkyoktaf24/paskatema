"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Loader2, Pencil, Plus, Power, Trash2, UserPlus } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { Modal } from "@/components/admin/Modal";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { UserPicker, type UserOption } from "@/components/admin/UserPicker";
import type { MediaItem } from "@/services/media";
import type { CandidateItem, PeriodItem, VotingItem, VotingResults } from "@/services/organisasi";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

export default function AdminVotingPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<VotingItem | "new" | null>(null);
  const [candidateFor, setCandidateFor] = useState<{ voting: VotingItem; candidate: CandidateItem | null } | null>(null);
  const [resultsFor, setResultsFor] = useState<VotingItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const votings = useQuery({
    queryKey: ["admin-voting"],
    queryFn: async () => (await apiClient.get<VotingItem[]>("/voting")).data,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-voting"] });
    queryClient.invalidateQueries({ queryKey: ["voting-active"] });
    queryClient.invalidateQueries({ queryKey: ["voting-all"] });
  };

  const toggle = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await apiClient.patch(`/voting/${id}`, { isActive })).data,
    onSuccess: invalidate,
    onError: (err) => setError(apiErrorMessage(err, "Gagal mengubah status pemilihan.")),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/voting/${id}`),
    onSuccess: invalidate,
    onError: (err) => setError(apiErrorMessage(err, "Gagal menghapus pemilihan.")),
  });

  const removeCandidate = useMutation({
    mutationFn: async ({ votingId, candidateId }: { votingId: string; candidateId: string }) =>
      apiClient.delete(`/voting/${votingId}/candidates/${candidateId}`),
    onSuccess: invalidate,
    onError: (err) => setError(apiErrorMessage(err, "Gagal menghapus kandidat.")),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Voting</h1>
          <p className="text-sm text-slate-500">
            Pemilihan Komandan/Wakil Komandan. Hanya satu pemilihan yang bisa dibuka; hasil tampil setelah ditutup.
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
        >
          <Plus size={16} />
          Pemilihan Baru
        </button>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {votings.isLoading && <p className="text-sm text-slate-400">Memuat...</p>}
      {votings.data?.length === 0 && (
        <p className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
          Belum ada pemilihan.
        </p>
      )}

      <div className="space-y-4">
        {votings.data?.map((voting) => (
          <div key={voting.id} className="rounded-[24px] border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{voting.title}</p>
                <p className="text-xs text-slate-500">
                  Periode {voting.period.name} · {voting.candidates.length} kandidat
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  voting.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {voting.isActive ? "Sedang dibuka" : "Ditutup"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setError(null);
                  const msg = voting.isActive
                    ? "Tutup pemilihan ini? Hasil akan langsung terlihat publik."
                    : "Buka pemilihan ini? Pemilihan lain yang sedang dibuka akan ditutup.";
                  if (window.confirm(msg)) toggle.mutate({ id: voting.id, isActive: !voting.isActive });
                }}
                disabled={toggle.isPending}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                  voting.isActive
                    ? "border border-slate-200 text-slate-700 hover:border-slate-300"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <Power size={13} />
                {voting.isActive ? "Tutup pemilihan" : "Buka pemilihan"}
              </button>
              <button
                onClick={() => setEditing(voting)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
              >
                <Pencil size={13} />
                Edit
              </button>
              <button
                onClick={() => setCandidateFor({ voting, candidate: null })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
              >
                <UserPlus size={13} />
                Tambah kandidat
              </button>
              {!voting.isActive && voting.candidates.length > 0 && (
                <button
                  onClick={() => setResultsFor(voting)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
                >
                  <BarChart3 size={13} />
                  Hasil
                </button>
              )}
              <button
                onClick={() => {
                  setError(null);
                  if (window.confirm(`Hapus pemilihan "${voting.title}"?`)) remove.mutate(voting.id);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={13} />
                Hapus
              </button>
            </div>

            {voting.candidates.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {voting.candidates.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-200">
                      {c.photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.photo.url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{c.user.name}</p>
                    <button
                      onClick={() => setCandidateFor({ voting, candidate: c })}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-800"
                      aria-label="Edit kandidat"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setError(null);
                        if (window.confirm(`Hapus kandidat ${c.user.name}?`))
                          removeCandidate.mutate({ votingId: voting.id, candidateId: c.id });
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Hapus kandidat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <VotingForm
          voting={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            invalidate();
            setEditing(null);
          }}
        />
      )}
      {candidateFor && (
        <CandidateForm
          voting={candidateFor.voting}
          candidate={candidateFor.candidate}
          onClose={() => setCandidateFor(null)}
          onSaved={() => {
            invalidate();
            setCandidateFor(null);
          }}
        />
      )}
      {resultsFor && <ResultsModal voting={resultsFor} onClose={() => setResultsFor(null)} />}
    </div>
  );
}

function VotingForm({
  voting,
  onClose,
  onSaved,
}: {
  voting: VotingItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(voting?.title ?? "");
  const [periodId, setPeriodId] = useState(voting?.period.id ?? "");
  const [error, setError] = useState<string | null>(null);

  const periods = useQuery({
    queryKey: ["admin-period"],
    queryFn: async () => (await apiClient.get<PeriodItem[]>("/period")).data,
  });

  const save = useMutation({
    mutationFn: async () =>
      voting
        ? (await apiClient.patch(`/voting/${voting.id}`, { title, periodId })).data
        : (await apiClient.post("/voting", { title, periodId })).data,
    onSuccess: onSaved,
    onError: (err) => setError(apiErrorMessage(err, "Gagal menyimpan pemilihan.")),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    save.mutate();
  }

  return (
    <Modal title={voting ? "Edit Pemilihan" : "Pemilihan Baru"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Judul</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="mis. Pemilihan Komandan 2027"
            className={inputClass}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Periode kepengurusan</span>
          <select required value={periodId} onChange={(e) => setPeriodId(e.target.value)} className={inputClass}>
            <option value="">Pilih periode</option>
            {periods.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        {!voting && (
          <p className="text-xs text-slate-400">Pemilihan dibuat dalam keadaan ditutup. Tambahkan kandidat dulu, lalu buka.</p>
        )}
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

function CandidateForm({
  voting,
  candidate,
  onClose,
  onSaved,
}: {
  voting: VotingItem;
  candidate: CandidateItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [user, setUser] = useState<UserOption | null>(null);
  const [vision, setVision] = useState(candidate?.vision ?? "");
  const [mission, setMission] = useState(candidate?.mission ?? "");
  const [photo, setPhoto] = useState<MediaItem | null>(candidate?.photo ?? null);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const base = `/voting/${voting.id}/candidates`;
      if (candidate) {
        return (await apiClient.patch(`${base}/${candidate.id}`, { vision, mission, photoId: photo?.id ?? null })).data;
      }
      return (await apiClient.post(base, { userId: user!.id, vision, mission, photoId: photo?.id })).data;
    },
    onSuccess: onSaved,
    onError: (err) => setError(apiErrorMessage(err, "Gagal menyimpan kandidat.")),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!candidate && !user) {
      setError("Pilih anggota yang menjadi kandidat.");
      return;
    }
    save.mutate();
  }

  return (
    <Modal title={candidate ? `Edit Kandidat — ${candidate.user.name}` : `Kandidat Baru — ${voting.title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!candidate && <UserPicker label="Anggota" value={user} onChange={setUser} />}
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Visi</span>
          <textarea required rows={3} value={vision} onChange={(e) => setVision(e.target.value)} className={inputClass} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Misi</span>
          <textarea required rows={4} value={mission} onChange={(e) => setMission(e.target.value)} className={inputClass} />
        </label>
        <MediaPicker label="Foto kandidat (opsional)" value={photo} onChange={setPhoto} accept="image/*" />
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

function ResultsModal({ voting, onClose }: { voting: VotingItem; onClose: () => void }) {
  const results = useQuery({
    queryKey: ["voting-results", voting.id],
    queryFn: async () => (await apiClient.get<VotingResults>(`/voting/${voting.id}/results`)).data,
  });

  return (
    <Modal title={`Hasil — ${voting.title}`} onClose={onClose}>
      {results.isLoading && <p className="text-sm text-slate-400">Memuat...</p>}
      {results.isError && (
        <p className="text-sm text-rose-600">{apiErrorMessage(results.error, "Gagal memuat hasil.")}</p>
      )}
      {results.data && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">{results.data.totalVotes} suara masuk</p>
          {results.data.results.map((c) => {
            const pct = results.data.totalVotes ? Math.round((c.votes / results.data.totalVotes) * 100) : 0;
            return (
              <div key={c.candidateId}>
                <div className="flex items-center justify-between text-sm">
                  <span className={c.rank === 1 ? "font-semibold text-slate-950" : "text-slate-600"}>
                    {c.rank}. {c.name}
                  </span>
                  <span className="tabular-nums text-slate-500">
                    {c.votes} · {pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${c.rank === 1 ? "bg-rose-600" : "bg-slate-300"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
