/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'shahid.mbc.net' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // Ensure we can use top-level await if needed in some libs
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  }
};

module.exports = nextConfig;
