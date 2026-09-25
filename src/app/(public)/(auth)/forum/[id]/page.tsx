"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Lock, Pencil, Pin, Trash2, Unlock } from "lucide-react";

import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ForumAvatar, ForumAuthorName } from "@/components/forum/ForumAvatar";
import {
  apiErrorMessage,
  boardLabel,
  timeAgo,
  type ForumAuthor,
  type ForumThreadDetail,
} from "@/services/forum";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

export default function ForumThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  const queryKey = ["forum-thread", id];
  const thread = useQuery({
    queryKey,
    queryFn: async () => (await apiClient.get<ForumThreadDetail>(`/forum/threads/${id}`)).data,
    enabled: !!user,
    retry: false,
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
  }

  const [reply, setReply] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const sendReply = useMutation({
    mutationFn: async () => (await apiClient.post(`/forum/threads/${id}/posts`, { body: reply })).data,
    onSuccess: () => {
      setReply("");
      refresh();
    },
    onError: (err) => setReplyError(apiErrorMessage(err, "Gagal mengirim balasan.")),
  });

  const moderate = useMutation({
    mutationFn: async (data: { isPinned?: boolean; isLocked?: boolean }) =>
      (await apiClient.patch(`/forum/threads/${id}`, data)).data,
    onSuccess: refresh,
  });

  const backHref =
    thread.data?.angkatan != null ? `/forum?angkatan=${thread.data.angkatan}` : "/forum";

  const removeThread = useMutation({
    mutationFn: async () => apiClient.delete(`/forum/threads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
      router.push(backHref);
    },
  });

  if (isLoading || !user || thread.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Memuat...
      </div>
    );
  }

  if (thread.isError || !thread.data) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">
            {apiErrorMessage(thread.error, "Topik tidak dapat dibuka.")}
          </p>
          <Link href="/forum" className="mt-4 inline-block text-sm font-semibold text-rose-600 hover:underline">
            ← Kembali ke forum
          </Link>
        </div>
      </main>
    );
  }

  const data = thread.data;
  const isAdmin = user.role === "ADMIN";
  const isAuthor = data.author.id === user.id;
  const canReply = !data.isLocked || isAdmin;

  function handleReply(event: FormEvent) {
    event.preventDefault();
    setReplyError(null);
    sendReply.mutate();
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-rose-600">
          <ArrowLeft size={15} />
          {boardLabel(data.angkatan)}
        </Link>

        <ThreadHeader
          data={data}
          canEdit={isAuthor || isAdmin}
          canDelete={isAuthor || isAdmin}
          onSaved={refresh}
          onDelete={() => {
            if (window.confirm("Hapus topik ini beserta semua balasannya?")) removeThread.mutate();
          }}
        />

        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => moderate.mutate({ isPinned: !data.isPinned })}
              disabled={moderate.isPending}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-60"
            >
              <Pin size={13} />
              {data.isPinned ? "Lepas sematan" : "Sematkan"}
            </button>
            <button
              onClick={() => moderate.mutate({ isLocked: !data.isLocked })}
              disabled={moderate.isPending}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-60"
            >
              {data.isLocked ? <Unlock size={13} /> : <Lock size={13} />}
              {data.isLocked ? "Buka kunci" : "Kunci topik"}
            </button>
          </div>
        )}

        <h2 className="pt-2 text-sm font-semibold text-slate-500">{data.posts.length} balasan</h2>

        <div className="space-y-3">
          {data.posts.map((post) => (
            <PostCard
              key={post.id}
              postId={post.id}
              author={post.author}
              body={post.body}
              createdAt={post.createdAt}
              edited={post.updatedAt !== post.createdAt}
              canEdit={post.author.id === user.id}
              canDelete={post.author.id === user.id || isAdmin}
              onChanged={refresh}
            />
          ))}
        </div>

        {canReply ? (
          <form onSubmit={handleReply} className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-5">
            <textarea
              required
              rows={3}
              maxLength={5000}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Tulis balasan..."
              className={inputClass}
            />
            {replyError && <p className="text-sm text-rose-600">{replyError}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sendReply.isPending || !reply.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {sendReply.isPending && <Loader2 size={15} className="animate-spin" />}
                Kirim Balasan
              </button>
            </div>
          </form>
        ) : (
          <p className="flex items-center justify-center gap-2 rounded-[24px] border border-slate-200 bg-white p-5 text-sm text-slate-500">
            <Lock size={15} />
            Topik ini dikunci admin. Balasan baru tidak bisa dikirim.
          </p>
        )}
      </div>
    </main>
  );
}

function ThreadHeader({
  data,
  canEdit,
  canDelete,
  onSaved,
  onDelete,
}: {
  data: ForumThreadDetail;
  canEdit: boolean;
  canDelete: boolean;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(data.title);
  const [body, setBody] = useState(data.body);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => (await apiClient.patch(`/forum/threads/${data.id}`, { title, body })).data,
    onSuccess: () => {
      setEditing(false);
      onSaved();
    },
    onError: (err) => setError(apiErrorMessage(err, "Gagal menyimpan topik.")),
  });

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            save.mutate();
          }}
          className="space-y-3"
        >
          <input required minLength={3} maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          <textarea required rows={6} maxLength={5000} value={body} onChange={(e) => setBody(e.target.value)} className={inputClass} />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <EditActions pending={save.isPending} onCancel={() => setEditing(false)} />
        </form>
      ) : (
        <>
          <h1 className="flex items-start gap-2 text-2xl font-semibold tracking-tight text-slate-950">
            {data.isPinned && <Pin size={18} className="mt-1.5 shrink-0 text-rose-600" aria-label="Disematkan" />}
            {data.isLocked && <Lock size={18} className="mt-1.5 shrink-0 text-slate-400" aria-label="Dikunci" />}
            <span className="break-words">{data.title}</span>
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <ForumAvatar author={data.author} />
            <div className="text-sm">
              <ForumAuthorName author={data.author} />
              <p className="text-xs text-slate-400">
                {timeAgo(data.createdAt)}
                {data.updatedAt !== data.createdAt && " · diedit"}
              </p>
            </div>
          </div>
          <p className="mt-5 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-slate-700">{data.body}</p>
          <OwnerActions
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={() => {
              setTitle(data.title);
              setBody(data.body);
              setEditing(true);
            }}
            onDelete={onDelete}
          />
        </>
      )}
    </article>
  );
}

function PostCard({
  postId,
  author,
  body,
  createdAt,
  edited,
  canEdit,
  canDelete,
  onChanged,
}: {
  postId: string;
  author: ForumAuthor;
  body: string;
  createdAt: string;
  edited: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => (await apiClient.patch(`/forum/posts/${postId}`, { body: draft })).data,
    onSuccess: () => {
      setEditing(false);
      onChanged();
    },
    onError: (err) => setError(apiErrorMessage(err, "Gagal menyimpan balasan.")),
  });

  const remove = useMutation({
    mutationFn: async () => apiClient.delete(`/forum/posts/${postId}`),
    onSuccess: onChanged,
  });

  return (
    <div className="flex gap-3 rounded-[24px] border border-slate-200 bg-white p-5">
      <ForumAvatar author={author} size={32} />
      <div className="min-w-0 flex-1">
        <div className="text-sm">
          <ForumAuthorName author={author} />
          <span className="ml-1.5 text-xs text-slate-400">
            {timeAgo(createdAt)}
            {edited && " · diedit"}
          </span>
        </div>
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              save.mutate();
            }}
            className="mt-2 space-y-3"
          >
            <textarea required rows={3} maxLength={5000} value={draft} onChange={(e) => setDraft(e.target.value)} className={inputClass} />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <EditActions pending={save.isPending} onCancel={() => setEditing(false)} />
          </form>
        ) : (
          <>
            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{body}</p>
            <OwnerActions
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={() => {
                setDraft(body);
                setEditing(true);
              }}
              onDelete={() => {
                if (window.confirm("Hapus balasan ini?")) remove.mutate();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

function OwnerActions({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!canEdit && !canDelete) return null;
  return (
    <div className="mt-3 flex gap-1">
      {canEdit && (
        <button onClick={onEdit} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <Pencil size={13} />
          Edit
        </button>
      )}
      {canDelete && (
        <button onClick={onDelete} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600">
          <Trash2 size={13} />
          Hapus
        </button>
      )}
    </div>
  );
}

function EditActions({ pending, onCancel }: { pending: boolean; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300">
        Batal
      </button>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
      >
        {pending && <Loader2 size={14} className="animate-spin" />}
        Simpan
      </button>
    </div>
  );
}
