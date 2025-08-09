import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { initializeApollo } from '../apollo/client';
import { initializeReactiveVars } from '../apollo/store';
import { appWithTranslation } from 'next-i18next';
import '../scss/app.scss';
import { useEffect } from 'react';

function App({ Component, pageProps }: AppProps) {
  const client = initializeApollo();
  
  useEffect(() => {
    // 반응형 변수 초기화
    initializeReactiveVars();
  }, []);
  
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default appWithTranslation(App); 
