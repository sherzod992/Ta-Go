/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// 로컬 개발을 위한 설정
	output: 'export',
	trailingSlash: true,
	images: {
		unoptimized: true
	},
	env: {
		NEXT_PUBLIC_API_URL: 'http://localhost:3000',
		NEXT_PUBLIC_API_GRAPHQL_URL: 'http://localhost:3000/graphql',
		NEXT_PUBLIC_API_WS: 'ws://localhost:3000',
	},
};

module.exports = nextConfig;
