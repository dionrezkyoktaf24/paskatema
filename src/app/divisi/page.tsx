import Image from "next/image";

const divisionCards = [
  {
    title: "Divisi Latihan",
    abbreviation: "DIKLAT",
    description:
      "Bertanggung jawab atas kurikulum pelatihan fisik, PBB (Peraturan Baris Berbaris), dan pembentukan mental anggota baru.",
    coordinator: "Bagas Prakoso",
    accent: "bg-rose-50 border-rose-200 text-rose-700",
    image: "/image2.jpeg",
  },
  {
    title: "Hubungan Masyarakat",
    abbreviation: "Humas",
    description:
      "Mengelola komunikasi eksternal, sosial media, dokumentasi kegiatan, dan menjaga citra positif PASKATEMA di mata publik.",
    coordinator: "Nadia Safira",
    accent: "bg-amber-50 border-amber-200 text-amber-700",
    image: "/image3.jpeg",
  },
  {
    title: "Perlengkapan",
    abbreviation: "DANLOG",
    description:
      "Inventarisasi, pemeliharaan atribut seragam, bendera, dan persiapan logistik teknis untuk setiap upacara maupun perlombaan.",
    coordinator: "Rizky Maulana",
    accent: "bg-slate-100 border-slate-200 text-slate-700",
    image: "/image4.jpeg",
  },
  {
    title: "Kedisiplinan",
    abbreviation: "PROVOS",
    description:
      "Menegakkan aturan organisasi, memantau absensi, dan memastikan kode etik dijunjung tinggi oleh seluruh anggota.",
    coordinator: "Agus Setiawan",
    accent: "bg-rose-50 border-rose-200 text-rose-700",
    image: "/image1.jpeg",
  },
];

const filterTabs = ["Semua", "Teknis", "Support"];

export default function DivisiPage() {
  return (
    <main className="min-h-screen bg-[#FCF9F8] px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">Divisi Operasional</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Roda penggerak organisasi yang terbagi dalam bidang spesialisasi.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Setiap divisi PASKATEMA memainkan peran khusus untuk memastikan tugas, acara, dan pelatihan berjalan sesuai standar.
          </p>
        </section>

        <section className="overflow-hidden rounded-[40px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
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
              <article key={division.title} className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] ${division.accent}`}>
                    {division.abbreviation}
                  </div>
                  <div className="h-14 w-14 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <Image src={division.image} alt={division.title} width={56} height={56} className="object-cover" />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{division.title}</h2>
                  <p className="text-sm leading-7 text-slate-600">{division.description}</p>
                </div>

                <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5 text-sm text-slate-700">
                  <p className="uppercase tracking-[0.35em] text-slate-500">Koordinator</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{division.coordinator}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
