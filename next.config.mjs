/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    'pdfjs-dist',
    '@napi-rs/canvas',
  ],
};

export default nextConfig;
