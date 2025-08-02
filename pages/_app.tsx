import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { initializeApollo } from '../apollo/client';
import '../scss/app.scss';

export default function App({ Component, pageProps }: AppProps) {
  const client = initializeApollo();
  
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
} 
