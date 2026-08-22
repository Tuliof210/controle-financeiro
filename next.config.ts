import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    loadPaths: ["src/styles"],
  },
  // Worktrees sit under the main checkout; without this, Next picks the
  // parent's lockfile and writes `.next` there, then Prisma resolves to the
  // wrong client.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
