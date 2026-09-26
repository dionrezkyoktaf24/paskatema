import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event",
  description: "Agenda dan dokumentasi kegiatan Paskatema SMK Telkom Malang.",
  alternates: { canonical: "/event" },
};

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return children;
}
