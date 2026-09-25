"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { getToken, setAuth } from "@/lib/auth-storage";
import { useAuth } from "@/contexts/AuthContext";
import { canUsePanel, homeForRole, panelLabel, type UserRole } from "@/lib/roles";
import { authInputClass } from "@/components/auth/AuthCard";
import { MemberGallery } from "@/components/auth/MemberGallery";

interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  bio: string | null;
  angkatan: number | null;
}

export default function AkunPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  const profile = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => (await apiClient.get<Profile>("/user/me")).data,
    enabled: !!user,
  });

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Memuat...
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">
            Akun Saya
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">{user.name}</h1>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-400">Email</dt>
              <dd className="break-all font-medium text-slate-800">{user.email}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Angkatan</dt>
              <dd className="font-medium text-slate-800">
                {profile.data?.angkatan != null
                  ? `Angkatan ${profile.data.angkatan}`
                  : "Belum diisi admin"}
              </dd>
            </div>
          </dl>
        </div>

        {profile.data ? (
          <ProfileForm
            profile={profile.data}
            onLogout={() => {
              logout();
              router.push("/");
            }}
          />
        ) : (
          <p className="text-center text-sm text-slate-400">
            {profile.isError ? "Gagal memuat profil." : "Memuat profil..."}
          </p>
        )}

        {profile.data && <MemberGallery angkatan={profile.data.angkatan} />}
      </div>
    </main>
  );
}

// Di-mount hanya setelah profil dari server ada, jadi state awal form
// langsung diisi dari props (tanpa setState di dalam effect).
function ProfileForm({
  profile,
  onLogout,
}: {
  profile: Profile;
  onLogout: () => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () =>
      (
        await apiClient.patch<Profile>("/user/me", {
          name: name.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
        })
      ).data,
    onSuccess: (updated) => {
      queryClient.setQueryData(["my-profile"], updated);
      // Nama di navbar dibaca dari localStorage, jadi ikut diperbarui.
      const token = getToken();
      if (token && user) setAuth(token, { ...user, name: updated.name });
      setSaved(true);
    },
    onError: () => setError("Gagal menyimpan. Coba lagi."),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setError(null);
    save.mutate();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60"
    >
      <h2 className="text-lg font-semibold text-slate-950">Edit profil</h2>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Nama lengkap</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={authInputClass}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">No. telepon</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={authInputClass}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Bio</span>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={authInputClass}
        />
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Profil tersimpan.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {save.isPending ? "Menyimpan..." : "Simpan"}
        </button>
        {canUsePanel(profile.role) && (
          <Link
            href={homeForRole(profile.role)}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
          >
            {panelLabel(profile.role)}
          </Link>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
        >
          Keluar
        </button>
      </div>
    </form>
  );
}
