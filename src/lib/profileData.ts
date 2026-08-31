export interface ProfileCard {
  role: string;
  title: string;
  name: string;
  batch: string;
  quote: string;
  image?: string;
}

export const profileCards: ProfileCard[] = [
  {
    role: "KOMANDAN PASUKAN",
    title: "Rizky Adiputra",
    name: "Angkatan 29",
    batch: "Angkatan 29",
    quote: "Kepemimpinan sejati adalah melayani, bukan dilayani. Setiap langkah adalah tanggung jawab.",
    image: "/image1.jpeg",
  },
  {
    role: "WAKIL KOMANDAN",
    title: "Aulia Rahma",
    name: "Angkatan 29",
    batch: "Angkatan 29",
    quote: "Kekuatan kita tidak hanya pada gerakan yang serempak, tapi pada hati yang saling percaya.",
    image: "/image2.jpeg",
  },
  {
    role: "DANRU PUTRA",
    title: "Bima Satria",
    name: "Angkatan 31",
    batch: "Angkatan 31",
    quote: "Pantang pulang sebelum tugas selesai dengan sempurna.",
    image: "/image3.jpeg",
  },
  {
    role: "DANRU PUTRI",
    title: "Citra Kirana",
    name: "Angkatan 31",
    batch: "Angkatan 31",
    quote: "Detail adalah kunci dari kesempurnaan formasi.",
    image: "/image4.jpeg",
  },
  {
    role: "ANGGOTA",
    title: "Dimas Anggara",
    name: "Angkatan 32",
    batch: "Angkatan 32",
    quote: "Belajar dari setiap kesalahan untuk menjadi lebih baik.",
  },
];
