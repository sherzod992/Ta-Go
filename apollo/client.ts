import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { createClient } from 'graphql-ws';
import { sweetErrorAlert } from '../libs/sweetAlert';

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
  // REACT_PUBLIC_API_GRAPHQL_URL 환경 변수도 확인 (기존 설정과의 호환성)
  return process.env.NEXT_PUBLIC_API_GRAPHQL_URL || process.env.REACT_PUBLIC_API_GRAPHQL_URL || 'http://72.60.40.57:3000/graphql';
};

const getWsUrl = () => {
  // REACT_APP_API_WS 환경 변수도 확인 (기존 설정과의 호환성)
  const baseWsUrl = process.env.NEXT_PUBLIC_API_WS || process.env.REACT_APP_API_WS || 'ws://72.60.40.57:3000';
  // WebSocket URL에 /graphql 경로가 없으면 추가
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

// 토큰 갱신 링크
const tokenRefreshLink = new TokenRefreshLink({
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
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
      
      // 사용자 친화적인 에러 메시지 표시
      sweetErrorAlert(`GraphQL 에러: ${message}`);
    });
  }

  if (networkError) {
    console.error('네트워크 에러:', networkError);
    console.error('네트워크 에러 작업:', operation.operationName);
    
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // 인증 에러 처리
      console.log('401 에러 발생, 로그인 페이지로 리다이렉트');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    } else {
      sweetErrorAlert('네트워크 에러: 서버와의 연결에 문제가 있습니다.');
    }
  }
});

// 링크 분할 (HTTP와 WebSocket 분리)
const splitLink = typeof window !== 'undefined' && wsLink
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

// WebSocket 연결 실패 시 HTTP만 사용하는 안전한 링크
const safeSplitLink = typeof window !== 'undefined' && wsLink
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
    link: safeSplitLink,
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
      },
    }),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
    },
    ssrMode: typeof window === 'undefined',
    ssrForceFetchDelay: 100,
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
