/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'cdn.tgdd.vn' },
      { protocol: 'https', hostname: 'media.coolmate.me' },
      { protocol: 'https', hostname: 'down-vn.img.susercontent.com' }
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig
