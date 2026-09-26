export type MemberStatus = "AKTIF" | "PURNA";

export const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  AKTIF: "Aktif",
  PURNA: "Purna",
};

export const MEMBER_STATUS_CLASS: Record<MemberStatus, string> = {
  AKTIF: "bg-emerald-50 text-emerald-700",
  PURNA: "bg-slate-100 text-slate-700",
};

export interface MemberProfile {
  id: string;
  name: string;
  angkatan: number;
  memberStatus: MemberStatus;
  avatarUrl: string | null;
  positions: { position: string; period: string; isActive: boolean }[];
  /** false = pengunjung hanya melihat data dasar (perlu login sebagai anggota). */
  detailsVisible: boolean;
  bio?: string | null;
  education?: string | null;
  occupation?: string | null;
  skills?: string[];
  linkedinUrl?: string | null;
  instagram?: string | null;
}
