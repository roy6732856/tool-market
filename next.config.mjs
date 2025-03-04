/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/tool-market' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/tool-market/' : '',
};

export default nextConfig;
