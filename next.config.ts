import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    loadPaths: ["src/styles"],
  },
};

export default nextConfig;
