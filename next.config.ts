/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://40.81.30.7:3000/api/:path*',
      },
    ];
  },
};

export default nextConfig;