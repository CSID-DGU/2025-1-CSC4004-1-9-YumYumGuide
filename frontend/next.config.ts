import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img-afd.7api-01.dp1.sej.co.jp',
        port: '',
        pathname: '/item-image/**',
      },
      {
        protocol: 'https',
        hostname: 'www.family.co.jp',
        port: '',
        pathname: '/content/dam/family/goods/**',
      },
      {
        protocol: 'https', 
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.lawson.co.jp',
        port: '',
        pathname: '/recommend/original/detail/img/**',
      },
      {
        protocol: 'https',
        hostname: 'ximg.retty.me',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;