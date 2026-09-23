"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ArrowLeft } from "lucide-react";

import { apiClient } from "@/lib/api";
import { formatNewsDate, type NewsArticle } from "@/services/news";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { Footer } from "@/components/footer/Footer";

export default function BeritaDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const article = useQuery({
    queryKey: ["news-public", slug],
    queryFn: async () =>
      (await apiClient.get<NewsArticle>(`/news/slug/${encodeURIComponent(slug)}`)).data,
    retry: (count, error) =>
      !(error instanceof AxiosError && error.response?.status === 404) && count < 2,
  });

  const notFound =
    article.error instanceof AxiosError && article.error.response?.status === 404;

  return (
    <main className="bg-white">
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-12">
        <Link
          href="/berita"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-rose-600"
        >
          <ArrowLeft size={16} /> Semua berita
        </Link>

        {article.isLoading && (
          <p className="mt-12 text-center text-sm text-slate-400">Memuat berita...</p>
        )}
        {notFound && (
          <p className="mt-12 text-center text-sm text-slate-500">Berita tidak ditemukan.</p>
        )}
        {article.isError && !notFound && (
          <p className="mt-12 text-center text-sm text-rose-600">
            Gagal memuat berita. Coba muat ulang halaman.
          </p>
        )}

        {article.data && (
          <>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {article.data.title}
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              {formatNewsDate(article.data.createdAt)}
              {article.data.author ? ` · ${article.data.author.name}` : ""}
            </p>

            {article.data.cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.data.cover.url}
                alt={article.data.title}
                className="mt-8 w-full rounded-[24px] object-cover"
              />
            )}

            <div className="mt-8">
              <MarkdownContent>{article.data.content}</MarkdownContent>
            </div>
          </>
        )}
      </article>
      <Footer />
    </main>
  );
}
