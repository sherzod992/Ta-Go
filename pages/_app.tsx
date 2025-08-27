import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { initializeApollo } from '../apollo/client';
import { LanguageProvider } from '../libs/contexts/LanguageContext';
import { LoadingProvider } from '../libs/contexts/LoadingContext';
import Head from 'next/head';
import '../scss/app.scss';
import { useMemo, useEffect } from 'react';
import { 
  preventInfiniteLoop, 
  resetLoopCounter, 
  preventExcessiveMounts, 
  resetMountCounter,
  initializeInfiniteLoopDetection
} from '../libs/utils/security';
import { appWithTranslation } from 'next-i18next';
import GlobalLoading from '../libs/components/common/GlobalLoading';

function App({ Component, pageProps }: AppProps) {
  // Apollo Client를 useMemo로 메모이제이션하여 안정성 확보
  const client = useMemo(() => initializeApollo(), []);
  
  // 개발 환경에서 디버깅 정보 출력
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('App 컴포넌트 마운트됨');
      console.log('현재 환경:', process.env.NODE_ENV);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    }
  }, []);
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <LoadingProvider>
        <LanguageProvider>
          <ApolloProvider client={client}>
            <GlobalLoading />
            <Component {...pageProps} />
          </ApolloProvider>
        </LanguageProvider>
      </LoadingProvider>
    </>
  );
}

export default appWithTranslation(App); 
