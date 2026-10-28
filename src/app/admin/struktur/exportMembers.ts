import { apiClient } from "@/lib/api";

interface ExportRow {
  name: string;
  email: string;
  phone: string | null;
  angkatan: number | null;
  memberStatus: "AKTIF" | "PURNA";
  role: string;
  education: string | null;
  occupation: string | null;
  skills: string[];
  linkedinUrl: string | null;
  instagram: string | null;
  openToMentor: boolean;
  createdAt: string;
}

const COLUMNS: [string, (r: ExportRow) => string][] = [
  ["Nama", (r) => r.name],
  ["Email", (r) => r.email],
  ["No. HP", (r) => r.phone ?? ""],
  ["Angkatan", (r) => (r.angkatan ?? "").toString()],
  ["Status", (r) => (r.angkatan === null ? "Belum diverifikasi" : r.memberStatus === "PURNA" ? "Purna" : "Aktif")],
  ["Role", (r) => r.role],
  ["Pendidikan", (r) => r.education ?? ""],
  ["Pekerjaan", (r) => r.occupation ?? ""],
  ["Keahlian", (r) => r.skills.join(", ")],
  ["LinkedIn", (r) => r.linkedinUrl ?? ""],
  ["Instagram", (r) => (r.instagram ? `@${r.instagram}` : "")],
  ["Bersedia mentor", (r) => (r.openToMentor ? "Ya" : "")],
  ["Terdaftar", (r) => new Date(r.createdAt).toLocaleDateString("id-ID")],
];

function cell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Unduh daftar anggota sesuai filter sebagai CSV. Pemisah ";" + BOM UTF-8
 * supaya langsung terbuka rapi di Excel berbahasa Indonesia.
 */
export async function exportMembersCsv(filters: {
  search?: string;
  memberStatus?: string;
  angkatan?: number;
}): Promise<number> {
  const { data } = await apiClient.get<{ data: ExportRow[] }>("/user", {
    params: { ...filters, page: 1, limit: 5000 },
  });
  const rows = data.data;
  const lines = [
    COLUMNS.map(([h]) => cell(h)).join(";"),
    ...rows.map((r) => COLUMNS.map(([, get]) => cell(get(r))).join(";")),
  ];
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const status = filters.memberStatus === "PURNA" ? "purna" : filters.memberStatus === "AKTIF" ? "aktif" : "anggota";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `paskatema-${status}${filters.angkatan ? `-angkatan-${filters.angkatan}` : ""}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  return rows.length;
}
