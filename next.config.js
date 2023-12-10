/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.s3.**.amazonaws.com',
                port: ''
            }
        ]
    },
    experimental: {
        serverActions: {
            allowedOrigins: ['http://localhost:3000', 'https://invoice.bktsk.com']
        }
    }
}

module.exports = nextConfig
