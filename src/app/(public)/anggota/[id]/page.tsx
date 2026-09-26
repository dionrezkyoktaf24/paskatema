"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, AtSign, Briefcase, ExternalLink, GraduationCap, Lock } from "lucide-react";

import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/footer/Footer";
import {
  MEMBER_STATUS_CLASS,
  MEMBER_STATUS_LABEL,
  type MemberProfile,
} from "@/services/member";

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();

  // Token ikut terkirim bila login (apiClient), jadi anggota mendapat profil lengkap.
  const profile = useQuery({
    queryKey: ["member-profile", id, user?.id ?? null],
    queryFn: async () => (await apiClient.get<MemberProfile>(`/user/profile/${id}`)).data,
    enabled: !authLoading,
    retry: false,
  });

  const notFound = profile.isError && axios.isAxiosError(profile.error) && profile.error.response?.status === 404;
  const data = profile.data;
  const hasDetails =
    data?.detailsVisible &&
    (data.education || data.occupation || data.skills?.length || data.linkedinUrl || data.instagram || data.bio);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-14">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link href="/anggota" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-rose-600">
          <ArrowLeft size={15} />
          Semua anggota
        </Link>

        {profile.isLoading && <p className="py-16 text-center text-sm text-slate-400">Memuat profil...</p>}
        {notFound && <p className="py-16 text-center text-sm text-slate-500">Anggota tidak ditemukan.</p>}
        {profile.isError && !notFound && (
          <p className="py-16 text-center text-sm text-rose-600">Gagal memuat profil. Coba muat ulang halaman.</p>
        )}

        {data && (
          <>
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="h-24 bg-gradient-to-r from-rose-600 to-rose-400" />
              <div className="px-6 pb-6 sm:px-8">
                <div className="-mt-12 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100">
                  {data.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.avatarUrl} alt={data.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-rose-600">
                      {data.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">{data.name}</h1>
                {data.detailsVisible && data.occupation && (
                  <p className="mt-1 text-sm text-slate-600">{data.occupation}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span>Angkatan {data.angkatan}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${MEMBER_STATUS_CLASS[data.memberStatus]}`}>
                    {MEMBER_STATUS_LABEL[data.memberStatus]}
                  </span>
                </div>
                {data.detailsVisible && (data.linkedinUrl || data.instagram) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.linkedinUrl && (
                      <a
                        href={data.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
                      >
                        <ExternalLink size={14} />
                        LinkedIn
                      </a>
                    )}
                    {data.instagram && (
                      <a
                        href={`https://instagram.com/${encodeURIComponent(data.instagram)}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
                      >
                        <AtSign size={14} />{data.instagram}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </section>

            {!data.detailsVisible && (
              <section className="flex items-start gap-3 rounded-[24px] border border-slate-200 bg-white p-6 text-sm text-slate-600">
                <Lock size={18} className="mt-0.5 shrink-0 text-slate-400" />
                <p>
                  Profil lengkap (pendidikan, pekerjaan, keahlian) hanya untuk sesama anggota Paskatema.{" "}
                  {!user && (
                    <Link href={`/login?next=/anggota/${id}`} className="font-semibold text-rose-600 hover:underline">
                      Masuk untuk melihat.
                    </Link>
                  )}
                </p>
              </section>
            )}

            {data.detailsVisible && (
              <section className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-6">
                {!hasDetails && <p className="text-sm text-slate-400">Anggota ini belum melengkapi profilnya.</p>}
                {data.bio && <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{data.bio}</p>}
                {data.education && (
                  <div className="flex items-start gap-3 text-sm">
                    <GraduationCap size={18} className="mt-0.5 shrink-0 text-rose-600" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pendidikan</p>
                      <p className="text-slate-800">{data.education}</p>
                    </div>
                  </div>
                )}
                {data.occupation && (
                  <div className="flex items-start gap-3 text-sm">
                    <Briefcase size={18} className="mt-0.5 shrink-0 text-rose-600" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pekerjaan</p>
                      <p className="text-slate-800">{data.occupation}</p>
                    </div>
                  </div>
                )}
                {!!data.skills?.length && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Keahlian</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {data.positions.length > 0 && (
              <section className="rounded-[24px] border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-slate-950">Riwayat di Paskatema</h2>
                <ul className="mt-3 space-y-2">
                  {data.positions.map((p, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-800">{p.position}</span>
                      <span className="text-slate-500">
                        {p.period}
                        {p.isActive && " · aktif"}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
