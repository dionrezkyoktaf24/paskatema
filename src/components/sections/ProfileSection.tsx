"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { profileCards } from "@/lib/profileData";

export function ProfileSection() {
  return (
    <section id="about" className="bg-[#FCF9F8] px-6 pb-16 pt-10 lg:px-10 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-rose-600">PROFILE ORGANISASI</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Mengenal Lebih Dekat Keluarga PASKATEMA</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Di balik seragam putih dan langkah tegas, terdapat individu-individu yang mendedikasikan diri untuk kehormatan, kedisiplinan, dan loyalitas tanpa batas. Kenali para komandan dan anggota yang menjadi nyawa organisasi ini.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {['Semua Angkatan', 'Profil Senior', 'Angkatan 31', 'Angkatan 32'].map((tab) => (
            <button
              key={tab}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {profileCards.map((profile) => (
            <motion.article
              key={profile.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {profile.image ? (
                  <Image src={profile.image} alt={profile.title} width={112} height={112} className="object-cover" />
                ) : (
                  <span className="text-slate-400">👤</span>
                )}
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">{profile.role}</p>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">{profile.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{profile.batch}</p>
              <p className="mt-6 text-sm leading-7 text-slate-600">{profile.quote}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
