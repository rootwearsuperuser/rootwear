/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.myshopify.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Updated configuration - moved from experimental.serverComponentsExternalPackages
  serverExternalPackages: ['canvas', 'jsdom'],
};

export default nextConfig;