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
	// 청크 인코딩 및 안정성 향상을 위한 설정
	experimental: {
		// 청크 인코딩 최적화
		optimizeCss: false,
		// 메모리 사용량 최적화
		optimizePackageImports: ['@mui/material', '@emotion/react', '@emotion/styled'],
		// 청크 인코딩 오류 해결을 위한 추가 설정
		scrollRestoration: false,
		// 정적 파일 최적화
		optimizeServerReact: false,
	},
	// 청크 인코딩 오류 해결을 위한 웹팩 설정
	webpack: (config, { dev, isServer }) => {
		// 청크 크기 최적화 - 청크 인코딩 오류 방지
		config.optimization = {
			...config.optimization,
			splitChunks: {
				chunks: 'all',
				maxSize: 244000, // 244KB로 청크 크기 제한
				minSize: 20000,  // 20KB 최소 크기
				cacheGroups: {
					default: {
						minChunks: 1,
						priority: -20,
						reuseExistingChunk: true,
					},
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendors',
						priority: -10,
						chunks: 'all',
						maxSize: 500000, // 500KB로 벤더 청크 크기 제한
					},
					// Next.js 관련 청크 최적화
					framework: {
						test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
						name: 'framework',
						priority: 40,
						chunks: 'all',
						enforce: true,
					},
					// 공통 컴포넌트 청크
					common: {
						name: 'common',
						minChunks: 2,
						priority: 20,
						chunks: 'all',
						reuseExistingChunk: true,
					},
				},
			},
		};

		// 청크 인코딩 오류 방지를 위한 설정
		config.output = {
			...config.output,
			chunkFilename: dev
				? 'static/chunks/[name].chunk.js'
				: 'static/chunks/[name].[contenthash].chunk.js',
		};

		return config;
	},
	// 개발 환경에서 안정성 향상을 위한 설정
	...(process.env.NODE_ENV === 'development' && {
		// 개발 환경에서 Fast Refresh 비활성화 옵션
		experimental: {
			// 무한 리렌더링 방지
			optimizeCss: false,
		}
	}),
	// 청크 인코딩 오류 해결을 위한 서버 설정
	serverRuntimeConfig: {
		// 서버 전용 설정
	},
	publicRuntimeConfig: {
		// 클라이언트에서 접근 가능한 설정
	},
	// 정적 파일 최적화
	compress: false, // 압축 비활성화 (청크 인코딩 오류 원인)
	poweredByHeader: false,
	generateEtags: false,
	// 청크 인코딩 오류 방지를 위한 타임아웃 설정
	onDemandEntries: {
		// 페이지 유지 시간
		maxInactiveAge: 25 * 1000,
		// 동시 페이지 수
		pagesBufferLength: 2,
	},
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000',
		NEXT_PUBLIC_API_GRAPHQL_URL: process.env.NEXT_PUBLIC_API_GRAPHQL_URL || process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3000/graphql',
		NEXT_PUBLIC_API_WS: process.env.NEXT_PUBLIC_API_WS || process.env.REACT_APP_API_WS || 'ws://localhost:3000',
	},
};

module.exports = nextConfig;


