"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { heroStats } from "@/lib/constants";
import Image from "next/image";
import { useState } from "react";
import { ImageLightbox } from "@/components/ui/ImageLightbox";


const heroImages = [
  "/image1.jpeg",
  "/image2.jpeg",
  "/image3.jpeg",
  "/image4.jpeg",
];

export function HeroSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openLightbox = (i: number) => setOpenIndex(i);
  const closeLightbox = () => setOpenIndex(null);
  const prev = () => setOpenIndex((i) => (i === null ? null : (i - 1 + heroImages.length) % heroImages.length));
  const next = () => setOpenIndex((i) => (i === null ? null : (i + 1) % heroImages.length));

  return (
    <section id="home" className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(253,186,202,0.2),_transparent_35%)] px-6 pb-16 pt-10 lg:px-10 lg:pb-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">
            satu tujuan, satu komando
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Kedisiplinan, Kehormatan,
            <span className="text-rose-600"> dan Persaudaraan</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            Paskibra SMK Telkom Malang bukan sekadar ekstrakurikuler. Kami adalah kawah candradimuka yang menempah karakter, fisik, dan jiwa kepemimpinan generasi muda Indonesia.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/pendaftaran" className="inline-flex h-14 items-center justify-center rounded-full bg-rose-600 px-6 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700">
              Daftar Angkatan Baru
            </Link>
            <Link href="#event" className="inline-flex h-14 items-center justify-center rounded-full border border-rose-600 px-6 text-sm font-semibold text-rose-600 transition hover:bg-rose-200">
              Lihat Event Antareja 🚀
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-xl lg:max-w-none"
        >
          <div className="relative overflow-hidden rounded-[36px] border border-slate-400 bg-mist-200 shadow-[0_35px_90px_-50px_rgba(15,23,42,0.35)]">
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 sm:p-6">
              {heroImages.map((src, index) => (
                <button
                  key={index}
                  onClick={() => openLightbox(index)}
                  className="relative overflow-hidden rounded-[28px] bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-rose-200"
                  aria-label={`Open image ${index + 1}`}
                >
                  <div className="relative aspect-[4/3] w-full">
                    <Image src={src} alt={`Hero image ${index + 1}`} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>
            <div className="absolute left-4 bottom-4 rounded-[28px] border border-white bg-white/95 px-5 py-4 shadow-lg shadow-slate-200/80">
              <p className="text-3xl font-semibold text-slate-950">{heroStats.title}</p>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{heroStats.subtitle}</p>
            </div>
          </div>
          {openIndex !== null && (
            <ImageLightbox images={heroImages} index={openIndex} onClose={closeLightbox} onPrev={prev} onNext={next} />
          )}
        </motion.div>
      </div>
    </section>
  );
}
