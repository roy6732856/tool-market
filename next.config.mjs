/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/tool-market' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/tool-market/' : '',
  trailingSlash: true,
};

export default nextConfig;
