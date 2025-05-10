/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: [], // Add any image domains you need here
    },
    // Enable static optimization for pages that can be statically generated
    experimental: {
        optimizeCss: true,
    },
}

module.exports = nextConfig 