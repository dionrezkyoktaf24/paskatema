import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build mandiri (bundle server + hanya dependency yang benar-benar
  // dipakai) supaya image Docker jauh lebih kecil dan tidak perlu
  // node_modules penuh di production.
  output: "standalone",
};

export default nextConfig;
