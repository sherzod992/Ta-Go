/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// i18n 설정 (다국어 지원)
	i18n: {
		defaultLocale: 'ko',
		locales: ['ko', 'en', 'ja', 'ru'],
		localeDetection: false,
	},
	// 로컬 개발을 위한 설정
	images: {
		unoptimized: true
	},
	// 개발 환경에서 안정성 향상을 위한 설정
	...(process.env.NODE_ENV === 'development' && {
		// 개발 환경에서 Fast Refresh 비활성화 옵션
		experimental: {
			// 무한 리렌더링 방지
			optimizeCss: false,
		},
	}),
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000',
		NEXT_PUBLIC_API_GRAPHQL_URL: process.env.NEXT_PUBLIC_API_GRAPHQL_URL || process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3000/graphql',
		NEXT_PUBLIC_API_WS: process.env.NEXT_PUBLIC_API_WS || process.env.REACT_APP_API_WS || 'ws://localhost:3000',
	},
};

module.exports = nextConfig;


