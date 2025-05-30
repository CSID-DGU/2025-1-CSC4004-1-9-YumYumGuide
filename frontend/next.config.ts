import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
      // 필요하다면 다른 외부 이미지 호스트도 여기에 추가할 수 있습니다.
    ],
  },
};

export default nextConfig;
