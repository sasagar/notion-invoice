const { Truculenta } = require('next/font/google')

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.s3.**.amazonaws.com',
                port: ''
            },
            {
                protocol: 'https',
                hostname: 'www.gravatar.com',
                port: ''
            }
        ]
    },
    experimental: {
        serverActions: {
            allowedOrigins: [
                'http://localhost:3000',
                'https://invoice.bktsk.com'
            ]
        }
    },
    async redirects() {
        return [
            {
                source: '/invoice',
                destination: '/invoice/list/1',
                permanent: true
            },
            {
                source: '/invoice/:id',
                destination: '/invoice/list/:id',
                permanent: true
            },
            {
                source: '/invoice/list',
                destination: '/invoice/list/1',
                permanent: true
            }
        ]
    }
}

module.exports = nextConfig
