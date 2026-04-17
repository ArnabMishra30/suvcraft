/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/uploads/:path*', destination: 'http://localhost/ecommerce/uploads/:path*' },
    ];
  },
};

export default nextConfig;