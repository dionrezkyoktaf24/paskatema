"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, MessageSquare, Pin, Plus, Search } from "lucide-react";

import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Modal } from "@/components/admin/Modal";
import { ForumAvatar } from "@/components/forum/ForumAvatar";
import {
  apiErrorMessage,
  boardLabel,
  timeAgo,
  type ForumBoards,
  type ForumThreadDetail,
  type ForumThreadList,
} from "@/services/forum";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

export default function ForumPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
          Memuat...
        </div>
      }
    >
      <ForumContent />
    </Suspense>
  );
}

function ForumContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Forum yang sedang dibuka ada di URL (?angkatan=32) supaya tombol "kembali"
  // dari halaman topik kembali ke forum yang sama.
  const angkatanParam = searchParams.get("angkatan");
  const board = angkatanParam ? Number(angkatanParam) : null;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  const boards = useQuery({
    queryKey: ["forum-boards"],
    queryFn: async () => (await apiClient.get<ForumBoards>("/forum/boards")).data,
    enabled: !!user,
    retry: false,
  });

  const threads = useQuery({
    queryKey: ["forum-threads", board, debouncedSearch, page],
    queryFn: async () =>
      (
        await apiClient.get<ForumThreadList>("/forum/threads", {
          params: { angkatan: board ?? undefined, search: debouncedSearch || undefined, page },
        })
      ).data,
    enabled: boards.isSuccess,
  });

  function selectBoard(angkatan: number | null) {
    setPage(1);
    setSearch("");
    router.replace(angkatan === null ? "/forum" : `/forum?angkatan=${angkatan}`);
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Memuat...
      </div>
    );
  }

  if (boards.isError) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center">
          <MessageSquare className="mx-auto text-rose-600" size={28} />
          <h1 className="mt-3 text-lg font-semibold text-slate-950">Forum belum bisa diakses</h1>
          <p className="mt-2 text-sm text-slate-500">
            {apiErrorMessage(boards.error, "Gagal memuat forum.")}
          </p>
          <Link href="/akun" className="mt-5 inline-block text-sm font-semibold text-rose-600 hover:underline">
            Ke halaman akun →
          </Link>
        </div>
      </main>
    );
  }

  const tabs: (number | null)[] = [null, ...(boards.data?.angkatan ?? [])];
  const meta = threads.data?.meta;

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">Forum Anggota</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{boardLabel(board)}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {board === null
                ? "Diskusi untuk semua angkatan."
                : `Hanya bisa dilihat anggota Angkatan ${board}.`}
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            disabled={!boards.isSuccess}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-60"
          >
            <Plus size={16} />
            Buat Topik
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((angkatan) => {
            const active = angkatan === board;
            return (
              <button
                key={angkatan ?? "umum"}
                onClick={() => selectBoard(angkatan)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-600"
                }`}
              >
                {boardLabel(angkatan)}
              </button>
            );
          })}
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari judul topik..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
          {(boards.isLoading || threads.isLoading) && (
            <p className="px-5 py-10 text-center text-sm text-slate-400">Memuat topik...</p>
          )}
          {threads.isError && (
            <p className="px-5 py-10 text-center text-sm text-rose-600">
              {apiErrorMessage(threads.error, "Gagal memuat topik.")}
            </p>
          )}
          {threads.isSuccess && threads.data.data.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-slate-400">
              {debouncedSearch ? "Tidak ada topik yang cocok." : "Belum ada topik. Jadilah yang pertama!"}
            </p>
          )}
          {threads.data?.data.map((thread) => (
            <Link
              key={thread.id}
              href={`/forum/${thread.id}`}
              className="flex items-start gap-4 border-t border-slate-100 px-5 py-4 transition first:border-t-0 hover:bg-slate-50"
            >
              <ForumAvatar author={thread.author} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-semibold text-slate-950">
                  {thread.isPinned && <Pin size={14} className="shrink-0 text-rose-600" aria-label="Disematkan" />}
                  {thread.isLocked && <Lock size={14} className="shrink-0 text-slate-400" aria-label="Dikunci" />}
                  <span className="truncate">{thread.title}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {thread.author.name} · {timeAgo(thread.createdAt)}
                </p>
              </div>
              <div className="shrink-0 text-right text-xs text-slate-500">
                <p className="inline-flex items-center gap-1 font-semibold text-slate-700">
                  <MessageSquare size={13} />
                  {thread.replyCount}
                </p>
                <p className="mt-0.5">{timeAgo(thread.lastActivityAt)}</p>
              </div>
            </Link>
          ))}

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
      </div>

      {creating && (
        <NewThreadModal
          board={board}
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
            router.push(`/forum/${id}`);
          }}
        />
      )}
    </main>
  );
}

function NewThreadModal({
  board,
  onClose,
  onCreated,
}: {
  board: number | null;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post<ForumThreadDetail>("/forum/threads", {
          title,
          body,
          angkatan: board,
        })
      ).data,
    onSuccess: (thread) => onCreated(thread.id),
    onError: (err) => setError(apiErrorMessage(err, "Gagal membuat topik.")),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    create.mutate();
  }

  return (
    <Modal title={`Topik Baru — ${boardLabel(board)}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Judul</span>
          <input
            required
            minLength={3}
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="mis. Info latihan hari Sabtu"
            className={inputClass}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Isi</span>
          <textarea
            required
            rows={6}
            maxLength={5000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={inputClass}
          />
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={create.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
        >
          {create.isPending && <Loader2 size={16} className="animate-spin" />}
          Kirim Topik
        </button>
      </form>
    </Modal>
  );
}
