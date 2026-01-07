/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // React 19 features
  reactStrictMode: true,
  
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  
  // Next.js 15 optimizations
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;