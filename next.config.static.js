/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // 정적 사이트 생성을 위한 설정
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    // i18n 비활성화 (정적 사이트에서는 제한적)
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://your-api-domain.com',
        NEXT_PUBLIC_API_GRAPHQL_URL: process.env.NEXT_PUBLIC_API_GRAPHQL_URL || 'https://your-api-domain.com/graphql',
        NEXT_PUBLIC_API_WS: process.env.NEXT_PUBLIC_API_WS || 'wss://your-api-domain.com',
    },
};

module.exports = nextConfig;
