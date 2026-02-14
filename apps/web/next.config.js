/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@bethehero/env'],
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
