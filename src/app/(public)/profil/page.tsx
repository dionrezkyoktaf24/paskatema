import type { Metadata } from "next";
import { AboutSection } from "@/components/sections/AboutSection";
import { ProfileSection } from "@/components/sections/ProfileSection";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "Profil",
  description: "Sejarah, visi, misi, dan profil Paskatema SMK Telkom Malang.",
  alternates: { canonical: "/profil" },
};

export default function ProfilPage() {
  return (
    <main className="min-h-screen bg-[#FCF9F8]">
      <AboutSection />
      <ProfileSection />
      <Footer />
    </main>
  );
}
