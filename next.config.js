/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  // Enable PWA features for future mobile app capability
  experimental: {
    esmExternals: false,
  }
}

module.exports = nextConfig
