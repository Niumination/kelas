/** @type {import('next').NextConfig} */
const nextConfig = {
  // Izinkan origin preview sandbox (dev server di balik proxy *.e2b.app)
  allowedDevOrigins: ['*.e2b.app', '*.arena.ai'],
  typescript: { ignoreBuildErrors: false },
}

export default nextConfig
