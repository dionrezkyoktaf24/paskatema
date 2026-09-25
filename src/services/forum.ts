import type { UserRole } from "@/lib/roles";

export interface ForumAuthor {
  id: string;
  name: string;
  angkatan: number | null;
  role: UserRole;
  avatar: { url: string } | null;
}

export interface ForumBoards {
  myAngkatan: number | null;
  isModerator: boolean;
  /** Forum angkatan yang bisa dibuka (anggota: angkatannya sendiri; admin: semua). */
  angkatan: number[];
}

export interface ForumThreadSummary {
  id: string;
  title: string;
  angkatan: number | null;
  isPinned: boolean;
  isLocked: boolean;
  lastActivityAt: string;
  createdAt: string;
  author: ForumAuthor;
  replyCount: number;
}

export interface ForumThreadList {
  data: ForumThreadSummary[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ForumPost {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: ForumAuthor;
}

export interface ForumThreadDetail extends Omit<ForumThreadSummary, "replyCount"> {
  body: string;
  updatedAt: string;
  posts: ForumPost[];
}

export function boardLabel(angkatan: number | null): string {
  return angkatan === null ? "Forum Umum" : `Angkatan ${angkatan}`;
}

/** "5 menit lalu", "2 hari lalu", atau tanggal untuk yang lebih lama. */
export function timeAgo(value: string): string {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} hari lalu`;
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export { apiErrorMessage } from "@/lib/api-error";
