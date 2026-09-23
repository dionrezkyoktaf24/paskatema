"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { AxiosError } from "axios";

import { apiClient } from "@/lib/api";
import {
  type AuthUser,
  clearAuth,
  getStoredUserRaw,
  parseUser,
  setAuth,
  subscribeAuth,
} from "@/lib/auth-storage";

interface LoginResponse {
  message: string;
  access_token: string;
  user: AuthUser;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** true selama render server / sebelum localStorage terbaca di browser. */
  isLoading: boolean;
  /** Mengembalikan user yang login supaya pemanggil bisa redirect sesuai role. */
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Di server localStorage tidak ada; `undefined` menandai "belum diketahui"
// (beda dengan `null` = sudah dicek dan memang belum login).
const getServerSnapshot = () => undefined;

export function AuthProvider({ children }: { children: ReactNode }) {
  const rawUser = useSyncExternalStore(
    subscribeAuth,
    getStoredUserRaw,
    getServerSnapshot,
  );

  const user = useMemo(() => parseUser(rawUser), [rawUser]);
  const isLoading = rawUser === undefined;

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    try {
      const response = await apiClient.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      setAuth(response.data.access_token, response.data.user);
      return response.data.user;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        throw new Error("Email atau password salah");
      }
      if (error instanceof AxiosError && error.response?.status === 429) {
        throw new Error("Terlalu banyak percobaan login. Tunggu 1 menit.");
      }
      throw new Error("Gagal login. Coba lagi beberapa saat.");
    }
  }, []);

  const register = useCallback(
    async (data: RegisterInput): Promise<AuthUser> => {
      try {
        await apiClient.post("/auth/register", {
          ...data,
          phone: data.phone || undefined,
        });
      } catch (error) {
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          if (status === 409) throw new Error("Email sudah terdaftar");
          if (status === 429) {
            throw new Error("Terlalu banyak percobaan. Tunggu 1 menit.");
          }
          if (status === 400) {
            throw new Error("Data tidak valid. Password minimal 8 karakter.");
          }
        }
        throw new Error("Gagal mendaftar. Coba lagi beberapa saat.");
      }
      return login(data.email, data.password);
    },
    [login],
  );

  const logout = useCallback(() => {
    clearAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  }
  return ctx;
}
