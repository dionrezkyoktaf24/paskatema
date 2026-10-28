import type { MemberStatus } from "@/services/member";

export interface NetworkMember {
  id: string;
  name: string;
  angkatan: number;
  memberStatus: MemberStatus;
  occupation: string | null;
  education: string | null;
  skills: string[];
  openToMentor: boolean;
  avatarUrl: string | null;
}

export type OpportunityType = "LOWONGAN" | "MAGANG" | "BEASISWA" | "LOMBA" | "LAINNYA";

export const OPPORTUNITY_TYPES: { value: OpportunityType; label: string }[] = [
  { value: "LOWONGAN", label: "Lowongan Kerja" },
  { value: "MAGANG", label: "Magang" },
  { value: "BEASISWA", label: "Beasiswa" },
  { value: "LOMBA", label: "Lomba" },
  { value: "LAINNYA", label: "Lainnya" },
];

export const OPPORTUNITY_LABEL = Object.fromEntries(
  OPPORTUNITY_TYPES.map((t) => [t.value, t.label]),
) as Record<OpportunityType, string>;

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  description: string;
  link: string | null;
  deadline: string | null;
  createdAt: string;
  author: { id: string; name: string; angkatan: number | null; memberStatus: MemberStatus };
}

export interface Paged<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
