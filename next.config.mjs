/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint dijalankan terpisah, tidak memblokir proses build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Sama untuk TypeScript strict errors
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "zcaivpcubtimlahaswqt.supabase.co"
      }
    ]
  }
};

export default nextConfig;
