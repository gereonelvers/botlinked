import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/SKILL.md",
        destination: "/skill.md",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
