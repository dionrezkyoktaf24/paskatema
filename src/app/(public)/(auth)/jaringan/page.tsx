"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, CalendarClock, ExternalLink, GraduationCap, Loader2, Plus, Search, Trash2, Users } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/contexts/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Modal } from "@/components/admin/Modal";
import { MEMBER_STATUS_CLASS, MEMBER_STATUS_LABEL, type MemberStatus } from "@/services/member";
import {
  OPPORTUNITY_LABEL,
  OPPORTUNITY_TYPES,
  type NetworkMember,
  type Opportunity,
  type OpportunityType,
  type Paged,
} from "@/services/network";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

interface MyProfile {
  id: string;
  angkatan: number | null;
  memberStatus: MemberStatus;
}

export default function JaringanPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"anggota" | "peluang">("anggota");

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login?next=/jaringan");
  }, [isLoading, user, router]);

  const me = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => (await apiClient.get<MyProfile>("/user/me")).data,
    enabled: !!user,
  });

  if (isLoading || !user || me.isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">Memuat...</div>;
  }

  const verified = user.role === "ADMIN" || me.data?.angkatan != null;
  if (!verified) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center">
          <Users className="mx-auto text-rose-600" size={28} />
          <h1 className="mt-3 text-lg font-semibold text-slate-950">Jaringan khusus anggota terverifikasi</h1>
          <p className="mt-2 text-sm text-slate-500">
            Ajukan verifikasi angkatan Anda (anggota aktif atau purna) dari halaman akun terlebih dahulu.
          </p>
          <Link href="/akun" className="mt-5 inline-block text-sm font-semibold text-rose-600 hover:underline">
            Ke Akun Saya →
          </Link>
        </div>
      </main>
    );
  }

  const canPost = user.role === "ADMIN" || me.data?.memberStatus === "PURNA";

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">Jaringan Paskatema</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Terhubung dengan anggota &amp; purna</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cari berdasarkan keahlian, pekerjaan, atau kampus, temukan mentor, dan lihat peluang yang dibagikan purna.
          </p>
        </div>

        <div className="flex gap-2 border-b border-slate-200">
          {(
            [
              { key: "anggota", label: "Anggota & Mentor" },
              { key: "peluang", label: "Peluang" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                tab === t.key ? "border-rose-600 text-rose-600" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "anggota" ? <MembersTab /> : <OpportunitiesTab canPost={canPost} myId={user.id} isAdmin={user.role === "ADMIN"} />}
      </div>
    </main>
  );
}

function MembersTab() {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search);
  const [status, setStatus] = useState<MemberStatus | "">("");
  const [mentor, setMentor] = useState(false);
  const [page, setPage] = useState(1);

  const members = useQuery({
    queryKey: ["network-members", debounced, status, mentor, page],
    queryFn: async () =>
      (
        await apiClient.get<Paged<NetworkMember>>("/network/members", {
          params: { search: debounced || undefined, memberStatus: status || undefined, mentor: mentor || undefined, page },
        })
      ).data,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama, keahlian, pekerjaan, kampus..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as MemberStatus | "");
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-400"
          aria-label="Status"
        >
          <option value="">Aktif &amp; purna</option>
          <option value="AKTIF">Aktif</option>
          <option value="PURNA">Purna</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={mentor}
            onChange={(e) => {
              setMentor(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 accent-rose-600"
          />
          Bersedia jadi mentor
        </label>
        {members.data && <span className="text-sm text-slate-500">{members.data.meta.total} orang</span>}
      </div>

      {members.isLoading && <p className="py-10 text-center text-sm text-slate-400">Memuat...</p>}
      {members.isError && (
        <p className="py-10 text-center text-sm text-rose-600">{apiErrorMessage(members.error, "Gagal memuat anggota.")}</p>
      )}
      {members.data?.data.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Tidak ada yang cocok.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.data?.data.map((m) => (
          <Link
            key={m.id}
            href={`/anggota/${m.id}`}
            className="group flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-100">
                {m.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.avatarUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="font-semibold text-rose-700">{m.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950 group-hover:text-rose-600">{m.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  Angkatan {m.angkatan}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${MEMBER_STATUS_CLASS[m.memberStatus]}`}>
                    {MEMBER_STATUS_LABEL[m.memberStatus]}
                  </span>
                  {m.openToMentor && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">Mentor</span>
                  )}
                </p>
              </div>
            </div>
            {m.occupation && (
              <p className="flex items-start gap-2 text-sm text-slate-700">
                <Briefcase size={15} className="mt-0.5 shrink-0 text-slate-400" />
                {m.occupation}
              </p>
            )}
            {m.education && (
              <p className="flex items-start gap-2 text-sm text-slate-700">
                <GraduationCap size={15} className="mt-0.5 shrink-0 text-slate-400" />
                {m.education}
              </p>
            )}
            {m.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {m.skills.slice(0, 6).map((s) => (
                  <span key={s} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      <Pager meta={members.data?.meta} page={page} setPage={setPage} />
    </div>
  );
}

function OpportunitiesTab({ canPost, myId, isAdmin }: { canPost: boolean; myId: string; isAdmin: boolean }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<OpportunityType | "">("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["network-opportunities", type, page],
    queryFn: async () => {
      const res = (
        await apiClient.get<Paged<Opportunity>>("/network/opportunities", { params: { type: type || undefined, page } })
      ).data;
      // Tandai yang sudah lewat batas waktu (dihitung saat data diambil, bukan saat render).
      const now = Date.now();
      return {
        ...res,
        data: res.data.map((o) => ({
          ...o,
          expired: o.deadline ? new Date(o.deadline).getTime() < now - 86_400_000 : false,
        })),
      };
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/network/opportunities/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["network-opportunities"] }),
    onError: (err) => setError(apiErrorMessage(err, "Gagal menghapus.")),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as OpportunityType | "");
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-400"
          aria-label="Jenis peluang"
        >
          <option value="">Semua jenis</option>
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {canPost ? (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
          >
            <Plus size={16} />
            Bagikan Peluang
          </button>
        ) : (
          <p className="text-xs text-slate-400">Peluang dibagikan oleh purna dan admin.</p>
        )}
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {list.isLoading && <p className="py-10 text-center text-sm text-slate-400">Memuat...</p>}
      {list.isError && (
        <p className="py-10 text-center text-sm text-rose-600">{apiErrorMessage(list.error, "Gagal memuat peluang.")}</p>
      )}
      {list.data?.data.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Belum ada peluang.</p>}

      <div className="space-y-3">
        {list.data?.data.map((o) => {
          const { expired } = o;
          return (
            <article key={o.id} className={`rounded-[24px] border border-slate-200 bg-white p-5 ${expired ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                    {OPPORTUNITY_LABEL[o.type]}
                  </span>
                  <h2 className="mt-2 text-lg font-semibold text-slate-950">{o.title}</h2>
                  <p className="text-sm text-slate-600">{o.organization}</p>
                </div>
                {(o.author.id === myId || isAdmin) && (
                  <button
                    onClick={() => {
                      setError(null);
                      if (window.confirm(`Hapus peluang "${o.title}"?`)) remove.mutate(o.id);
                    }}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Hapus peluang"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{o.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                {o.deadline && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock size={13} />
                    {expired ? "Sudah ditutup" : "Batas"}{" "}
                    {new Date(o.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
                <span>
                  Dibagikan {o.author.name}
                  {o.author.angkatan ? ` (Angkatan ${o.author.angkatan})` : ""}
                </span>
                {o.link && (
                  <a
                    href={o.link}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:underline"
                  >
                    <ExternalLink size={13} />
                    Info &amp; daftar
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <Pager meta={list.data?.meta} page={page} setPage={setPage} />

      {creating && (
        <OpportunityForm
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            queryClient.invalidateQueries({ queryKey: ["network-opportunities"] });
          }}
        />
      )}
    </div>
  );
}

function OpportunityForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [type, setType] = useState<OpportunityType>("LOWONGAN");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post("/network/opportunities", {
          title,
          organization,
          type,
          description,
          link: link.trim() || undefined,
          deadline: deadline || undefined,
        })
      ).data,
    onSuccess: onSaved,
    onError: (err) => setError(apiErrorMessage(err, "Gagal menyimpan peluang.")),
  });

  return (
    <Modal title="Bagikan Peluang" onClose={onClose}>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          setError(null);
          save.mutate();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Judul</span>
            <input required minLength={3} maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Frontend Developer Intern" className={inputClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Instansi</span>
            <input required minLength={2} maxLength={150} value={organization} onChange={(e) => setOrganization(e.target.value)} className={inputClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Jenis</span>
            <select value={type} onChange={(e) => setType(e.target.value as OpportunityType)} className={inputClass}>
              {OPPORTUNITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Deskripsi</span>
          <textarea required minLength={10} maxLength={5000} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Syarat, cara daftar, kontak..." className={inputClass} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Link (opsional)</span>
            <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className={inputClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Batas waktu (opsional)</span>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
          </label>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={save.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
        >
          {save.isPending && <Loader2 size={16} className="animate-spin" />}
          Bagikan
        </button>
      </form>
    </Modal>
  );
}

function Pager({
  meta,
  page,
  setPage,
}: {
  meta?: { totalPages: number };
  page: number;
  setPage: (fn: (p: number) => number) => void;
}) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between text-sm text-slate-500">
      <span>
        Halaman {page} dari {meta.totalPages}
      </span>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40">
          Sebelumnya
        </button>
        <button
          disabled={page >= meta.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}
