import { ApolloClient, InMemoryCache, createHttpLink, from, split, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { createClient } from 'graphql-ws';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { safeRedirect } from '../libs/utils/security';

// WebSocket 연결 상태 모니터링을 위한 래퍼
const createWebSocketWithLogging = (url: string) => {
  const ws = new WebSocket(url);
  
  ws.onopen = () => {
    console.log('WebSocket 연결됨');
  };

  ws.onclose = () => {
    console.log('WebSocket 연결 끊어짐');
  };

  ws.onerror = (error) => {
    console.error('WebSocket 에러:', error);
  };

  return ws;
};

// 환경 변수에서 API URL 가져오기
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 
         process.env.NEXT_PUBLIC_API_GRAPHQL_URL || 
         process.env.REACT_PUBLIC_API_GRAPHQL_URL || 
         'http://72.60.40.57:3000/graphql';
};

const getWsUrl = () => {
  const baseWsUrl = process.env.NEXT_PUBLIC_API_WS || process.env.REACT_APP_API_WS || 'ws://72.60.40.57:3000';
  return baseWsUrl.endsWith('/graphql') ? baseWsUrl : `${baseWsUrl}/graphql`;
};

// HTTP 링크 생성
const httpLink = createHttpLink({
  uri: getApiUrl(),
  credentials: 'include',
});

// WebSocket 링크 생성 (안전한 방식)
let wsLink: GraphQLWsLink | null = null;

if (typeof window !== 'undefined') {
  try {
    wsLink = new GraphQLWsLink(
      createClient({
        url: getWsUrl(),
        connectionParams: {
          authToken: localStorage.getItem('accessToken') || null,
        },
        webSocketImpl: WebSocket,
        on: {
          connected: () => {
            console.log('GraphQL WebSocket 연결됨');
          },
          closed: () => {
            console.log('GraphQL WebSocket 연결 끊어짐');
          },
        },
        retryAttempts: 3,
      })
    );
  } catch (error) {
    console.warn('WebSocket 링크 생성 실패, HTTP만 사용합니다:', error);
    wsLink = null;
  }
}

// 인증 헤더 설정
const authLink = setContext((operation, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  console.log('AuthLink called for operation:', operation.operationName);
  console.log('AuthLink - Token:', token);
  console.log('AuthLink - Headers before:', headers);
  
  const authHeaders = {
    ...headers,
    authorization: token ? `Bearer ${token}` : '',
  };
  
  console.log('AuthLink - Headers after:', authHeaders);
  
  return {
    headers: authHeaders,
  };
});

// 개발 환경에서는 토큰 갱신 비활성화 (무한 루프 방지)
const tokenRefreshLink = process.env.NODE_ENV === 'development' 
  ? new ApolloLink(() => null)
  : new TokenRefreshLink({
      accessTokenField: 'accessToken',
      isTokenValidOrUndefined: () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) return true;
        
        try {
          const base64 = token.split('.')[1];
          const payload = JSON.parse(
            typeof window !== 'undefined' 
              ? atob(base64) 
              : Buffer.from(base64, 'base64').toString()
          );
          const exp = payload.exp * 1000;
          return Date.now() < exp;
        } catch {
          return false;
        }
      },
      fetchAccessToken: async () => {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        if (!refreshToken) throw new Error('리프레시 토큰이 없습니다');

        const response = await fetch(`${getApiUrl()}/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error('토큰 갱신 실패');
        }

        const data = await response.json();
        return data;
      },
      handleFetch: (accessToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
        }
      },
      handleError: (err) => {
        console.error('토큰 갱신 에러:', err);
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // 무한 리다이렉트 방지를 위해 안전한 리다이렉트 함수 사용
          safeRedirect('/login');
        }
      },
    });

// 에러 처리 링크
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  console.log('ErrorLink called for operation:', operation.operationName);
  
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL 에러: ${message}`,
        `위치: ${locations}`,
        `경로: ${path}`,
        `작업: ${operation.operationName}`
      );
      
      // 개발 환경에서는 에러 알림을 조용히 처리
      if (process.env.NODE_ENV !== 'development') {
        sweetErrorAlert(`GraphQL 에러: ${message}`);
      }
    });
  }

  if (networkError) {
    console.error('네트워크 에러:', networkError);
    console.error('네트워크 에러 작업:', operation.operationName);
    
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // 인증 에러 처리 - 개발 환경에서는 조용히 처리
      console.log('401 에러 발생');
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // 무한 리다이렉트 방지를 위해 안전한 리다이렉트 함수 사용
        safeRedirect('/login');
      }
    } else {
      // 개발 환경에서는 네트워크 에러를 조용히 처리
      if (process.env.NODE_ENV === 'development') {
        console.log('개발 환경에서 네트워크 에러 발생 (백엔드 연결 확인 필요)');
        return;
      }
      // 프로덕션에서만 에러 알림 표시
      sweetErrorAlert('네트워크 에러: 서버와의 연결에 문제가 있습니다.');
    }
  }
});

// WebSocket 비활성화 (안정성을 위해)
const safeSplitLink = from([tokenRefreshLink, errorLink, authLink, httpLink]);

// WebSocket 링크 활성화 (Subscription 지원)
const splitLink = wsLink 
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      from([tokenRefreshLink, errorLink, authLink, httpLink])
    )
  : from([tokenRefreshLink, errorLink, authLink, httpLink]);

// Apollo Client 생성
export function createApolloClient(initialState = {}) {
  return new ApolloClient({
    link: splitLink, // safeSplitLink 대신 splitLink 사용
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // 캐시 정책 설정
            articles: {
              merge(existing = [], incoming) {
                return incoming;
              },
            },
            properties: {
              merge(existing = [], incoming) {
                return incoming;
              },
            },
          },
        },
        // Subscription 캐시 정책 추가
        Subscription: {
          fields: {
            messageSent: {
              merge(existing = [], incoming) {
                return incoming;
              },
            },
            chatRoomUpdated: {
              merge(existing = [], incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: false,
        pollInterval: 0, // 폴링 완전 비활성화
        // 개발 환경에서 추가 안정성 설정
        ...(process.env.NODE_ENV === 'development' && {
          errorPolicy: 'ignore', // 개발 환경에서는 에러를 무시
        }),
      },
      query: {
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
        // 개발 환경에서 추가 안정성 설정
        ...(process.env.NODE_ENV === 'development' && {
          errorPolicy: 'ignore', // 개발 환경에서는 에러를 무시
        }),
      },
      mutate: {
        errorPolicy: 'all',
        // 개발 환경에서 추가 안정성 설정
        ...(process.env.NODE_ENV === 'development' && {
          errorPolicy: 'ignore', // 개발 환경에서는 에러를 무시
        }),
      },
      // Subscription 설정은 별도로 처리
    },
    ssrMode: typeof window === 'undefined',
  });
}

// 초기 상태로 Apollo Client 초기화
export function initializeApollo(initialState = null) {
  const _apolloClient = createApolloClient();
  
  if (initialState) {
    _apolloClient.cache.restore(initialState);
  }
  
  if (typeof window === 'undefined') return _apolloClient;
  
  if (!window.__APOLLO_CLIENT__) {
    window.__APOLLO_CLIENT__ = _apolloClient;
  }
  
  return _apolloClient;
}

// React 훅으로 Apollo Client 사용
export function useApollo(initialState: any) {
  const store = initializeApollo(initialState);
  return store;
}

// 헤더 가져오기 함수
export function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

// 전역 타입 선언
declare global {
  interface Window {
    __APOLLO_CLIENT__: ApolloClient<any>;
  }
}
