import type { Metadata } from "next";
import Image from "next/image";
import { Footer } from "@/components/footer/Footer";

const commandHierarchy = {
  principal: {
    name: "Bpk. Firman",
    title: "Pembina Paskatema",
    image: "/image4.jpeg",
  },
  chair: {
    name: "Alif Fahreza Bintang M",
    title: "Ketua Umum",
    image: "/image2.jpeg",
  },
  members: [
    {
      name: "Rina Amelia",
      title: "Sekretaris",
      image: "/image1.jpeg",
    },
    {
      name: "Dimas Prasetyo",
      title: "Wakil Ketua",
      image: "/image3.jpeg",
    },
    {
      name: "Siti Nurhaliza",
      title: "Bendahara",
      image: "/dev22.jpeg",
    },

  ],
  seniors: [
    "/image1.jpeg",
    "/image2.jpeg",
    "/image3.jpeg",
    "/image4.jpeg",
  ],
};

const divisionCards = [
  {
    title: "Divisi Latihan",
    abbreviation: "DIKLAT",
    description:
      "Bertanggung jawab atas kurikulum pelatihan fisik, PBB (Peraturan Baris Berbaris), dan pembentukan mental anggota baru.",
    coordinator: "Bagas Prakoso",
    accent: "bg-rose-50 border-rose-200 text-rose-700",
  },
  {
    title: "Hubungan Masyarakat",
    abbreviation: "",
    description:
      "Mengelola komunikasi eksternal, sosial media, dokumentasi kegiatan, dan menjaga citra positif PASKATEMA di mata publik.",
    coordinator: "Nadia Safira",
    accent: "bg-amber-50 border-amber-200 text-amber-700",
  },
  {
    title: "Perlengkapan",
    abbreviation: "DANLOG",
    description:
      "Inventarisasi, pemeliharaan atribut seragam, bendera, dan persiapan logistik teknis untuk setiap upacara maupun perlombaan.",
    coordinator: "Rizky Maulana",
    accent: "bg-slate-100 border-slate-200 text-slate-700",
  },
  {
    title: "Kedisiplinan",
    abbreviation: "PROVOS",
    description:
      "Menegakkan aturan organisasi, memantau absensi, dan memastikan kode etik dijunjung tinggi oleh seluruh anggota.",
    coordinator: "Agus Setiawan",
    accent: "bg-rose-50 border-rose-200 text-rose-700",
  },
];

const filterTabs = ["Semua", "Teknis", "Support"];

export const metadata: Metadata = {
  title: "Struktur Organisasi",
  description: "Struktur kepengurusan Paskatema SMK Telkom Malang: komandan, pembina, dan jajaran pengurus.",
  alternates: { canonical: "/struktur" },
};

export default function StrukturPage() {
  return (
    <main className="min-h-screen bg-[#FCF9F8] px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">Struktur Komando</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Hirarki Kepengurusan
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Bagan organisasi PASKATEMA yang terstruktur memastikan koordinasi, disiplin, dan eksekusi program kerja berjalan dengan presisi tinggi.
          </p>
        </section>

        <section className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-rose-50/90 to-transparent" />
          <div className="relative z-10">
            <div className="flex justify-center">
              <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white px-8 py-8 text-center shadow-sm">
                <div className="mx-auto mb-5 h-24 w-24 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                  <Image
                    src={commandHierarchy.principal.image}
                    alt={commandHierarchy.principal.title}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">
                  {commandHierarchy.principal.title}
                </p>
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                  {commandHierarchy.principal.name}
                </h2>
              </div>
            </div>

            <div className="relative mt-10 flex justify-center">
              <div className="h-12 w-px rounded-full bg-slate-200" />
            </div>

            <div className="relative mx-auto mt-10 max-w-4xl">
              <div className="absolute left-1/2 top-0 h-10 w-px -translate-x-1/2 bg-slate-200" />
              <div className="relative">
                <div className="absolute left-1/2 top-full h-14 w-px -translate-x-1/2 bg-slate-200" />
                <div className="flex justify-center">
                  <div className="relative overflow-hidden rounded-[32px] border border-rose-200 bg-rose-50 px-8 py-9 text-center shadow-sm">
                    <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border border-rose-200 bg-slate-100">
                      <Image
                        src={commandHierarchy.chair.image}
                        alt={commandHierarchy.chair.title}
                        width={112}
                        height={112}
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">
                      {commandHierarchy.chair.title}
                    </p>
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                      {commandHierarchy.chair.name}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16">
              <div className="relative mx-auto max-w-5xl">
                <div className="absolute left-1/2 top-6 h-10 w-px -translate-x-1/2 bg-slate-200" />
                <div className="absolute inset-x-0 top-10 flex justify-center">
                  <div className="h-px w-4/5 rounded-full bg-slate-200" />
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                  {commandHierarchy.members.map((member) => (
                    <div key={member.name} className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
                      <div className="absolute left-1/2 top-0 h-10 w-px -translate-x-1/2 bg-slate-200" />
                      <div className="mt-6 flex justify-center">
                        <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                          <Image
                            src={member.image}
                            alt={member.title}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                        {member.title}
                      </p>
                      <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                        {member.name}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-4 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            <div className="flex -space-x-3">
              {commandHierarchy.seniors.slice(0, 4).map((src, index) => (
                <div
                  key={index}
                  className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm"
                >
                  <Image src={src} alt={`Senior ${index + 1}`} width={40} height={40} className="object-cover" />
                </div>
              ))}
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-500">
                +5
              </span>
            </div>
            <span>Deretan Senior</span>
          </div>
        </div>

        <section className="mt-20 bg-[#FCF9F8] px-6 py-16 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">Divisi Operasional</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Roda penggerak organisasi yang terbagi dalam bidang spesialisasi untuk memastikan setiap program berjalan maksimal.
              </h2>
            </div>

            <div className="mb-8 flex flex-wrap gap-3">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {divisionCards.map((division) => (
                <article
                  key={division.title}
                  className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
                >
                  <div className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] ${division.accent}`}> 
                    {division.abbreviation || division.title}
                  </div>
                  <div className="mt-6 space-y-4">
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                      {division.title}
                    </h3>
                    <p className="text-sm leading-7 text-slate-600">{division.description}</p>
                  </div>
                  <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Koordinator</p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">{division.coordinator}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
