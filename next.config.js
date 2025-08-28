/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// i18n 설정 (다국어 지원)
	i18n: {
		defaultLocale: 'ko',
		locales: ['ko', 'en', 'ja', 'ru'],
		localeDetection: false,
	},
	// Docker 배포를 위한 설정
	output: 'standalone',
	// 이미지 최적화 설정
	images: {
		unoptimized: true,
		// 이미지 크기 제한
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		// 이미지 형식 지원
		formats: ['image/webp', 'image/avif'],
	},
	// 개발 환경에서 안정성 향상을 위한 설정
	...(process.env.NODE_ENV === 'development' && {
		// 개발 환경에서 Fast Refresh 비활성화 옵션
		experimental: {
			// 무한 리렌더링 방지
			optimizeCss: false,
		},
		// Fast Refresh 비활성화
		fastRefresh: false,
	}),
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'http://72.60.40.57:3000',
		NEXT_PUBLIC_API_GRAPHQL_URL: process.env.NEXT_PUBLIC_API_GRAPHQL_URL || process.env.REACT_APP_API_GRAPHQL_URL || 'http://72.60.40.57:3000/graphql',
		NEXT_PUBLIC_API_WS: process.env.NEXT_PUBLIC_API_WS || process.env.REACT_APP_API_WS || 'ws://72.60.40.57:3000',
	},
};

module.exports = nextConfig;


