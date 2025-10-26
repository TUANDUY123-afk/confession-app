/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
    // Tăng giới hạn kích thước ảnh để support ảnh lớn từ iOS
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840, 4096],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
  },
  // Tăng body size limit để support upload ảnh lớn
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

export default nextConfig
