/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/paintballTop',
  assetPrefix: '/paintballTop/',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
