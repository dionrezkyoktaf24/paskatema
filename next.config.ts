import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build mandiri (bundle server + hanya dependency yang benar-benar
  // dipakai) supaya image Docker jauh lebih kecil dan tidak perlu
  // node_modules penuh di production.
  output: "standalone",

  // Proxy /api/* ke backend lokal saat development, supaya axios client
  // (baseURL relatif "/api", lihat src/lib/api.ts) langsung nyambung tanpa
  // perlu setup CORS. Di production hal ini TIDAK pernah dipakai karena
  // Traefik sudah menangkap request /api/* dan meneruskannya langsung ke
  // container backend sebelum sampai ke Next.js (lihat docker-compose.yml
  // di repo backend) — jadi rewrite ini aman, tidak bentrok dengan setup
  // production.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3001";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
