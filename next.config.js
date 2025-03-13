/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add transpilePackages to handle Supabase node-fetch issues with Turbopack
  transpilePackages: [
    '@supabase/ssr',
    '@supabase/supabase-js',
    '@supabase/auth-helpers-nextjs',
    '@supabase/node-fetch'
  ],
  images: {
    domains: [
      'idpesfrwikdnugdufvfr.supabase.co',
    
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.fischer.group',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'idpesfrwikdnugdufvfr.supabase.co',
        port: '',
        pathname: '/**',
      },
      
    ],
  },
}

module.exports = nextConfig