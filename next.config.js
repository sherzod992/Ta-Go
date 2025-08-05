/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: 'standalone', // 정적 내보내기 대신 standalone 모드 사용
	env: {
		REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3007',
		REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql',
		REACT_APP_API_WS: process.env.REACT_APP_API_WS || 'ws://localhost:3007/graphql',
	},
};

// i18n 비활성화 (선택사항)
// const { i18n } = require('./next-i18next.config');
// nextConfig.i18n = i18n;

module.exports = nextConfig;
