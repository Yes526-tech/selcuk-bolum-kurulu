/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: ["pdf-lib", "@prisma/client", "prisma", "docx"]
  }
};

export default nextConfig;
