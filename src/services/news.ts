export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  /** Isi berita dalam Markdown (disimpan backend sebagai file .md). */
  content: string;
  cover: { id: string; url: string } | null;
  author: { id: string; name: string } | null;
  createdAt: string;
}

export function formatNewsDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Ringkasan polos dari Markdown untuk kartu daftar berita. */
export function newsExcerpt(markdown: string, max = 140): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? `${plain.slice(0, max).trimEnd()}…` : plain;
}
