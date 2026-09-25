import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pemilihan",
  description: "Pemilihan Komandan dan Wakil Komandan Paskatema SMK Telkom Malang.",
  alternates: { canonical: "/voting" },
};

export default function VotingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
