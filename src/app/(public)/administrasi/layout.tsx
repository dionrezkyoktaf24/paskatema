import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pusat Administrasi",
  description: "Materi diklat dan dokumen administrasi untuk anggota Paskatema SMK Telkom Malang.",
  alternates: { canonical: "/administrasi" },
};

export default function AdministrasiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
