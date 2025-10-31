/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '.next',  // This is the default, can be removed
  images: {
    unoptimized: true,
  }
  // Remove the module.exports line
}

export default nextConfig