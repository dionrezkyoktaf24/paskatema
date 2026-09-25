"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function DeveloperSection() {
  return (
    <section id="developer" className="bg-[#FCF9F8] px-6 pb-16 pt-10 lg:px-10 lg:pb-24">
      <div className="mx-auto max-w-7xl space-y-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">THE DIGITAL VANGUARD</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Memperkuat Masa Depan Paskatema Digital
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              Kami adalah tim di balik layar yang menggabungkan disiplin militeristik dengan inovasi teknologi untuk menghadirkan platform digital terbaik bagi organisasi.
            </p>
            <p className="mt-8 text-sm font-medium uppercase tracking-[0.32em] text-rose-600">Tim Pengembang</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg"
          >
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-rose-100 to-transparent" />
            <div className="relative overflow-hidden rounded-[28px] bg-slate-950 p-6">
              <Image src="/image1.jpeg" alt="Developer illustration" width={680} height={520} className="h-full w-full object-cover" />
            </div>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">Tim Pengembang</p>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Sinergi antara kreativitas visual dan ketangguhan sistem untuk menciptakan pengalaman digital yang tak terlupakan.
            </p>
          </div>
          <div className="inline-flex rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-rose-600/20">
            3 Core Members
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100">
              <Image src="/dev44.jpeg" alt="The Architect" width={360} height={480} className="h-[28rem] w-full object-cover" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Syafi Aqil</p>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">UI/UX Designer</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Merancang sistem visual "Vibrant Scholastic" yang memadukan kedisiplinan militeristik dengan dinamisme modernitas situs.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Figma</span>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Design Systems</span>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
            className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100">
              <Image src="/dev22.jpeg" alt="The Sculptor" width={360} height={480} className="h-[28rem] w-full object-cover" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Dion Rezky Oktafino</p>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">Frontend Engineer</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Mewujudkan desain menjadi antarmuka yang responsif, cepat, dan interaktif dengan presisi tinggi pada setiap transisi.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Next.js</span>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">TypeScript</span>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Tailwind CSS</span>
              
              


            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
            className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100">
              <Image src="/dev33.jpeg" alt="The Strategist" width={360} height={480} className="h-[28rem] w-full object-cover" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Alif Fahreza Bintang M</p>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">Backend Specialist</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Mengelola arus data administrasi, keamanan sistem pendaftaran, dan stabilitas server organisasi.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Node.js</span>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">PostgreSQL</span>
            </div>
          </motion.article>
        </div>

        <div className="overflow-hidden rounded-[32px] bg-rose-950 p-8 text-white shadow-lg">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200">Filosofi Desain</p>
              <h2 className="text-3xl font-semibold tracking-tight">Menerjemahkan Jiwa Paskatema ke dalam Kode</h2>
              <p className="max-w-2xl text-sm leading-7 text-rose-100">
                Setiap elemen visual dalam platform ini bukan sekadar estetika. Warna Crimson Red melambangkan keberanian, sedangkan struktur grid yang kuat merefleksikan kedisiplinan. Kami percaya bahwa kehormatan organisasi harus tercermin melalui performa web yang cepat dan antarmuka yang transparan.
              </p>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl bg-white/10 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200">Loyalitas</p>
                <p className="mt-3 text-sm leading-7 text-rose-100">Stabilitas sistem 24/7 untuk anggota.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200">Kehormatan</p>
                <p className="mt-3 text-sm leading-7 text-rose-100">Konsistensi data yang tak terbantahkan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
