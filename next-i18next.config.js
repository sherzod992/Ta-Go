module.exports = {
	i18n: {
		defaultLocale: 'ko',
		locales: ['ko', 'en', 'ja', 'ru'],
		localeDetection: true,
	},
	trailingSlash: false,
	react: {
		useSuspense: false,
	},
	// SSR 환경에서의 경고 억제
	serverLanguageDetection: false,
	strictMode: false,
};
