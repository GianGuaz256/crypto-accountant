/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [""],
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
    };
    return config;
  },
  // Configure Turbopack
  experimental: {
    turbo: {
      rules: {
        // Configure Turbopack rules here
      },
    },
  },
};

module.exports = nextConfig;
