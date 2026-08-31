"use client";

import { motion } from "framer-motion";
import { visionItems, timelineItems } from "@/lib/constants";

export function AboutSection() {
  return (
    <section id="about" className="bg-white px-6 pb-16 pt-10 lg:px-10 lg:pb-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Napas Kehormatan</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Jejak langkah perjuangan dan nilai luhur yang menjadi pondasi setiap anggota Paskatema.
          </h2>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-6">
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="grid gap-6 rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-sm"
            >
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.35em] text-rose-600">Visi & Misi</p>
                <p className="text-base leading-8 text-slate-700">Menjadi organisasi unggul yang mencetak generasi disiplin, berjiwa korsa tinggi, dan siap menjadi teladan bagi pelajar lainnya di SMK Telkom Malang.</p>
              </div>
              <div className="space-y-3">
                {visionItems[0].points?.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-3xl bg-white/90 p-4 shadow-sm">
                    <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold">•</span>
                    <p className="text-sm leading-7 text-slate-700">{point}</p>
                  </div>
                ))}
              </div>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
              className="overflow-hidden rounded-[32px] bg-rose-600 p-8 text-white shadow-lg shadow-rose-600/10"
            >
              <p className="text-sm uppercase tracking-[0.35em] text-rose-100/80">Panca Nilai Dasar</p>
              <p className="mt-4 text-lg font-semibold leading-8">Kejujuran, Tanggung Jawab, Kerjasama, Respek, dan Kepedulian.</p>
            </motion.article>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-3 text-slate-900">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">🧭</span>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-rose-600">Perjalanan Paskatema</p>
              </div>
            </div>
            <div className="space-y-8">
              {timelineItems.map((item, index) => (
                <div key={item.year} className="relative pl-8">
                  <div className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full bg-rose-600" />
                  {index < timelineItems.length - 1 ? <div className="absolute left-1.25 top-7 h-full w-px bg-slate-200" /> : null}
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{item.year}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
