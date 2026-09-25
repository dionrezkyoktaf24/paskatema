import type { ForumAuthor } from "@/services/forum";
import { ROLE_LABEL } from "@/lib/roles";

export function ForumAvatar({ author, size = 36 }: { author: ForumAuthor; size?: number }) {
  if (author.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={author.avatar.url}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {author.name.charAt(0).toUpperCase()}
    </span>
  );
}

/** Nama penulis + angkatan + lencana Admin/Bendahara. */
export function ForumAuthorName({ author }: { author: ForumAuthor }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
      <span className="font-semibold text-slate-900">{author.name}</span>
      {author.angkatan !== null && (
        <span className="text-xs text-slate-400">· Angkatan {author.angkatan}</span>
      )}
      {author.role !== "USER" && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            author.role === "ADMIN" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {ROLE_LABEL[author.role]}
        </span>
      )}
    </span>
  );
}
