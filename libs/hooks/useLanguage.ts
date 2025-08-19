import { useRouter } from 'next/router';
import { useCallback } from 'react';

export const useLanguage = () => {
  const router = useRouter();

  const changeLanguage = useCallback((locale: string) => {
    const { pathname, asPath, query } = router;
    
    // 현재 경로를 유지하면서 언어만 변경
    router.push(
      {
        pathname,
        query,
      },
      asPath,
      { locale }
    );
  }, [router]);

  return {
    currentLocale: router.locale || 'ko',
    changeLanguage,
  };
};
