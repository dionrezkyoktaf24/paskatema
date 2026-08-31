export const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Profil & Sejarah", href: "/profil" },
  { label: "Struktur & Divisi", href: "/struktur" },
  { label: "Anggota", href: "/anggota" },
  { label: "Administrasi", href: "/administrasi" },
  { label: "Developer", href: "/developer" },
];

export const heroStats = {
  title: "32+",
  subtitle: "ANGKATAN TERBENTUK",
};

interface VisionItem {
  title: string;
  description: string;
  points?: string[];
}

export const visionItems: VisionItem[] = [
  {
    title: "Visi & Misi",
    description:
      "Menjadi organisasi unggul yang mencetak generasi disiplin, berjiwa korsa tinggi, dan siap menjadi teladan bagi pelajar lainnya di SMK Telkom Malang.",
    points: [
      "Menjunjung tinggi Tri Satya dan Dasa Dharma.",
      "Memupuk rasa cinta tanah air dan patriotisme.",
    ],
  },
  {
    title: "Panca Nilai Dasar",
    description:
      "Kejujuran, Tanggung Jawab, Kerjasama, Respek, dan Kepedulian.",
  },
];

export const timelineItems = [
  {
    year: "1992",
    title: "Pembentukan Awal",
    description:
      "Didirikan dengan tujuan menaungi siswa-siswi SMK Telkom Malang yang memiliki minat di bidang baris-berbaris dan pengibaran bendera pusaka.",
  },
  {
    year: "2005",
    title: "Era Transformasi",
    description: "Sistem Pendidikan Terpadu",
  },
  {
    year: "2018",
    title: "Prestasi Nasional",
    description: "Membawa Nama Almamater",
  },
  {
    year: "2024",
    title: "Inovasi Antareja",
    description: "Event Kompetisi Terbesar",
  },
];

export const eventCard = {
  label: "EVENT TAHUNAN",
  title: "L.K.B.B ANTAREJA",
  description:
    "Lomba Ketangkasan Baris-Berbaris tingkat Provinsi Jawa Timur. Panggung kehormatan bagi peleton terbaik untuk merebutkan Piala Bergilir Gubernur.",
  stats: [
    { value: "64+", label: "PELETON" },
    { value: "30", label: "KOTA/KAB" },
    { value: "1", label: "PIALA BERGILIR" },
  ],
};

export const footerLinks = [
  { label: "Sejarah", href: "#about" },
  { label: "Struktur", href: "#structure" },
  { label: "Event Antareja", href: "#event" },
];

export const contactInfo = {
  headline: "Pasukan Pengibar Bendera SMK Telkom Malang.",
  subtext: "Kedisiplinan, Loyalitas, dan Kehormatan adalah nafas kami.",
  address: "Jl. Danau Ranau, Sawojajar, Kec. Kedungkandang, Kota Malang",
};
