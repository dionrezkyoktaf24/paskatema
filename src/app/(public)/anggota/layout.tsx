import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anggota",
  description: "Daftar anggota Paskatema SMK Telkom Malang berdasarkan angkatan beserta jabatannya.",
  alternates: { canonical: "/anggota" },
};

export default function AnggotaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
