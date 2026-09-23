import axios from "axios";
import { clearAuth, getToken } from "./auth-storage";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status === 401 && typeof window !== "undefined") {
      clearAuth();
      const { pathname } = window.location;
      // Halaman auth menampilkan error 401 (mis. password salah) sendiri;
      // redirect di sini akan me-reload halaman dan menghapus pesan error.
      const isAuthPage = ["/admin/login", "/login", "/daftar"].includes(pathname);
      if (!isAuthPage) {
        window.location.href = pathname.startsWith("/admin")
          ? "/admin/login"
          : "/login";
      }
    }
    return Promise.reject(error);
  },
);
