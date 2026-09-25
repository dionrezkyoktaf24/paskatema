import type { MediaItem } from "@/services/media";

// ---------- Struktur ----------
export interface PeriodItem {
  id: string;
  name: string;
  isActive: boolean;
}

export interface StructureItem {
  id: string;
  user: {
    id: string;
    name: string;
    angkatan: number | null;
    avatar: { url: string } | null;
  };
  position: { id: string; name: string; level: number };
  period: PeriodItem;
  image: MediaItem | null;
}

/** Foto struktur (khusus jabatan) diutamakan, lalu foto profil anggota. */
export function structurePhoto(item: StructureItem): string | null {
  return item.image?.url ?? item.user.avatar?.url ?? null;
}

// ---------- Formulir pendaftaran ----------
export const FIELD_TYPES = [
  { value: "text", label: "Teks singkat" },
  { value: "textarea", label: "Paragraf" },
  { value: "number", label: "Angka" },
  { value: "email", label: "Email" },
  { value: "tel", label: "No. telepon" },
  { value: "date", label: "Tanggal" },
  { value: "select", label: "Pilihan (dropdown)" },
] as const;

export type FieldType = (typeof FIELD_TYPES)[number]["value"];

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

export interface FormSetting {
  id: string;
  title: string;
  isActive: boolean;
  schema: FormField[];
  createdAt: string;
  _count?: { registrations: number };
}

export type RegistrationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export const STATUS_LABEL: Record<RegistrationStatus, string> = {
  PENDING: "Menunggu",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
};

export const STATUS_CLASS: Record<RegistrationStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  ACCEPTED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-slate-100 text-slate-600",
};

export interface RegistrationItem {
  id: string;
  status: RegistrationStatus;
  answers: Record<string, string | number>;
  createdAt: string;
  form: { id: string; title: string; schema?: FormField[] };
  user?: { id: string; name: string; email: string; phone?: string | null };
}

// ---------- Voting ----------
export interface CandidateItem {
  id: string;
  vision: string;
  mission: string;
  user: { id: string; name: string };
  photo: MediaItem | null;
}

export interface VotingItem {
  id: string;
  title: string;
  isActive: boolean;
  period: PeriodItem;
  candidates: CandidateItem[];
}

export interface VotingResults {
  votingId: string;
  title: string;
  totalVotes: number;
  results: {
    rank: number;
    candidateId: string;
    name: string;
    photo: MediaItem | null;
    votes: number;
  }[];
}

export interface MyVote {
  id: string;
  candidate: { id: string; user: { id: string; name: string } };
}
