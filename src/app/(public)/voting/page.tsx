"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2, Loader2, Trophy, Vote } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/footer/Footer";
import type { CandidateItem, MyVote, VotingItem, VotingResults } from "@/services/organisasi";

function CandidatePhoto({ url, name, size = 96 }: { url?: string | null; name: string; size?: number }) {
  return (
    <div className="mx-auto overflow-hidden rounded-full border border-slate-200 bg-slate-100" style={{ width: size, height: size }}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-rose-600">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default function VotingPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const active = useQuery({
    queryKey: ["voting-active"],
    queryFn: async () => (await apiClient.get<VotingItem>("/voting/active")).data,
    retry: false,
  });
  const noActive = active.isError && axios.isAxiosError(active.error) && active.error.response?.status === 404;

  const myVote = useQuery({
    queryKey: ["my-vote", active.data?.id],
    queryFn: async () => (await apiClient.get<MyVote | null>(`/voting/${active.data!.id}/my-vote`)).data,
    enabled: !!user && !!active.data,
  });

  const all = useQuery({
    queryKey: ["voting-all"],
    queryFn: async () => (await apiClient.get<VotingItem[]>("/voting")).data,
  });
  // Hasil hanya dibuka backend untuk voting yang sudah ditutup.
  const closed = (all.data ?? []).filter((v) => !v.isActive && v.candidates.length > 0);
  const results = useQueries({
    queries: closed.map((v) => ({
      queryKey: ["voting-results", v.id],
      queryFn: async () => (await apiClient.get<VotingResults>(`/voting/${v.id}/results`)).data,
    })),
  });
  const finished = results
    .map((r) => r.data)
    .filter((r): r is VotingResults => !!r && r.totalVotes > 0);

  const [choice, setChoice] = useState<CandidateItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cast = useMutation({
    mutationFn: async (candidateId: string) =>
      (await apiClient.post(`/voting/${active.data!.id}/vote`, { candidateId })).data,
    onSuccess: () => {
      setChoice(null);
      queryClient.invalidateQueries({ queryKey: ["my-vote"] });
    },
    onError: (err) => setError(apiErrorMessage(err, "Gagal mengirim suara.")),
  });

  const voted = myVote.data?.candidate;

  return (
    <main className="min-h-screen bg-[#FCF9F8] px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">Pemilihan</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {active.data ? active.data.title : "Pemilihan Komandan"}
          </h1>
          {active.data && (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Periode {active.data.period.name}. Setiap anggota hanya punya satu suara dan pilihan tidak bisa diubah.
            </p>
          )}
        </section>

        {active.isLoading && <p className="text-center text-sm text-slate-400">Memuat pemilihan...</p>}
        {noActive && (
          <div className="mx-auto max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 text-center">
            <Vote className="mx-auto text-rose-600" size={28} />
            <p className="mt-3 font-semibold text-slate-950">Tidak ada pemilihan yang sedang berlangsung</p>
            <p className="mt-2 text-sm text-slate-500">Hasil pemilihan sebelumnya ada di bawah.</p>
          </div>
        )}

        {active.data && (
          <>
            {!user ? (
              <div className="mx-auto mb-8 max-w-xl rounded-[24px] border border-rose-200 bg-rose-50 p-5 text-center text-sm text-slate-700">
                <Link href="/login?next=/voting" className="font-semibold text-rose-600 hover:underline">
                  Masuk
                </Link>{" "}
                untuk memberikan suara. Hanya anggota yang angkatannya sudah terdaftar yang dapat memilih.
              </div>
            ) : voted ? (
              <div className="mx-auto mb-8 flex max-w-xl items-center justify-center gap-2 rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-800">
                <CheckCircle2 size={18} />
                Anda sudah memilih {voted.user.name}. Terima kasih!
              </div>
            ) : null}

            {active.data.candidates.length === 0 ? (
              <p className="text-center text-sm text-slate-400">Kandidat belum diumumkan.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {active.data.candidates.map((candidate) => {
                  const isMine = voted?.id === candidate.id;
                  return (
                    <article
                      key={candidate.id}
                      className={`flex flex-col rounded-[32px] border bg-white p-7 shadow-sm ${isMine ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-200"}`}
                    >
                      <CandidatePhoto url={candidate.photo?.url} name={candidate.user.name} />
                      <h2 className="mt-5 text-center text-xl font-semibold text-slate-950">{candidate.user.name}</h2>
                      <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Visi</p>
                          <p className="mt-1 whitespace-pre-wrap">{candidate.vision}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Misi</p>
                          <p className="mt-1 whitespace-pre-wrap">{candidate.mission}</p>
                        </div>
                      </div>
                      {user && !voted && (
                        <div className="mt-auto pt-6">
                          <button
                            onClick={() => {
                              setError(null);
                              setChoice(candidate);
                            }}
                            className="w-full rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
                          >
                            Pilih {candidate.user.name.split(" ")[0]}
                          </button>
                        </div>
                      )}
                      {isMine && (
                        <p className="mt-6 text-center text-sm font-semibold text-emerald-700">Pilihan Anda</p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {finished.length > 0 && (
          <section className="mt-20">
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-950">
              <Trophy size={22} className="text-rose-600" />
              Hasil Pemilihan
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {finished.map((r) => (
                <div key={r.votingId} className="rounded-[28px] border border-slate-200 bg-white p-6">
                  <p className="font-semibold text-slate-950">{r.title}</p>
                  <p className="text-xs text-slate-400">{r.totalVotes} suara</p>
                  <div className="mt-4 space-y-3">
                    {r.results.map((c) => {
                      const pct = r.totalVotes ? Math.round((c.votes / r.totalVotes) * 100) : 0;
                      return (
                        <div key={c.candidateId}>
                          <div className="flex items-center justify-between text-sm">
                            <span className={c.rank === 1 ? "font-semibold text-slate-950" : "text-slate-600"}>
                              {c.rank === 1 && "🏆 "}
                              {c.name}
                            </span>
                            <span className="tabular-nums text-slate-500">
                              {c.votes} · {pct}%
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${c.rank === 1 ? "bg-rose-600" : "bg-slate-300"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {choice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-2xl">
            <CandidatePhoto url={choice.photo?.url} name={choice.user.name} size={72} />
            <p className="mt-4 text-lg font-semibold text-slate-950">Pilih {choice.user.name}?</p>
            <p className="mt-2 text-sm text-slate-500">Suara tidak bisa diubah setelah dikirim.</p>
            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setChoice(null)}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                onClick={() => cast.mutate(choice.id)}
                disabled={cast.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {cast.isPending && <Loader2 size={15} className="animate-spin" />}
                Ya, pilih
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
