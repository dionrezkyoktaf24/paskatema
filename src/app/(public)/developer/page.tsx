import type { Metadata } from "next";
import { Footer } from "@/components/footer/Footer";
import { DeveloperSection } from "@/components/sections/DeveloperSection";

export const metadata: Metadata = {
  title: "Developer",
  description: "Tim pengembang website Paskatema SMK Telkom Malang.",
  alternates: { canonical: "/developer" },
};

export default function DeveloperPage() {
  return (
    <main className="overflow-hidden bg-white">
      <DeveloperSection />
      <Footer />
    </main>
  );
}
