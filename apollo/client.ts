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
  // 브라우저에서 실행 중이고 ta-go.shop 도메인인 경우 강제로 도메인 사용
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'ta-go.shop' || hostname === 'www.ta-go.shop') {
      console.log('🔧 강제로 도메인 API URL 사용:', 'http://ta-go.shop/graphql');
      return 'http://ta-go.shop/graphql';
    }
  }
  
  // 개발 환경에서는 localhost 우선, 없으면 원격 서버 사용
  if (process.env.NODE_ENV === 'development') {
    const localUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL || 'http://localhost:3000';
    const remoteUrl = process.env.NEXT_PUBLIC_REMOTE_API_URL || 'http://72.60.40.57:3001';
    
    // 환경 변수로 어떤 서버를 사용할지 선택 가능
    const useLocal = process.env.NEXT_PUBLIC_USE_LOCAL === 'true';
    
    const baseUrl = useLocal ? localUrl : remoteUrl;
    return baseUrl.endsWith('/graphql') ? baseUrl : `${baseUrl}/graphql`;
  }
  
  // 프로덕션에서는 도메인 사용
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                  process.env.NEXT_PUBLIC_API_GRAPHQL_URL || 
                  process.env.REACT_PUBLIC_API_GRAPHQL_URL || 
                  'https://ta-go.shop';
  
  // /graphql 엔드포인트가 포함되어 있지 않으면 추가
  return baseUrl.endsWith('/graphql') ? baseUrl : `${baseUrl}/graphql`;
};

const getWsUrl = () => {
  // 브라우저에서 실행 중이고 ta-go.shop 도메인인 경우 강제로 도메인 사용
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'ta-go.shop' || hostname === 'www.ta-go.shop') {
      console.log('🔧 강제로 도메인 WebSocket URL 사용:', 'ws://ta-go.shop/graphql');
      return 'ws://ta-go.shop/graphql';
    }
  }
  
  // 개발 환경에서는 localhost 우선, 없으면 원격 서버 사용
  if (process.env.NODE_ENV === 'development') {
    const localWsUrl = process.env.NEXT_PUBLIC_LOCAL_WS_URL || 'ws://localhost:3000';
    const remoteWsUrl = process.env.NEXT_PUBLIC_REMOTE_WS_URL || 'ws://72.60.40.57:3001';
    
    // 환경 변수로 어떤 서버를 사용할지 선택 가능
    const useLocal = process.env.NEXT_PUBLIC_USE_LOCAL === 'true';
    
    const baseWsUrl = useLocal ? localWsUrl : remoteWsUrl;
    return baseWsUrl.endsWith('/graphql') ? baseWsUrl : `${baseWsUrl}/graphql`;
  }
  
  // 프로덕션에서는 도메인 사용
  const baseWsUrl = process.env.NEXT_PUBLIC_API_WS || process.env.REACT_APP_API_WS || 'wss://ta-go.shop';
  return baseWsUrl.endsWith('/graphql') ? baseWsUrl : `${baseWsUrl}/graphql`;
};

// HTTP 링크 생성 (CORS 오류 해결)
const httpLink = createHttpLink({
  uri: getApiUrl(), // 환경 변수 기반으로 동적 URL 설정
  credentials: 'omit', // include 대신 omit 사용하여 CORS 오류 해결
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  fetchOptions: {
    mode: 'cors',
  },
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

// 인증 헤더 설정 (Authorization 헤더 사용)
const authLink = setContext((operation, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  console.log('AuthLink called for operation:', operation.operationName);
  console.log('AuthLink - Token:', token ? '토큰 존재' : '토큰 없음');
  
  const authHeaders = {
    ...headers,
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
  
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
  // 모든 에러에 대해 상세한 로깅 추가
  console.log(`[ERROR_LINK] 작업: ${operation.operationName}`);
  console.log(`[ERROR_LINK] 변수:`, operation.variables);
  
  // Bearer Token 에러 특별 처리
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(`[ERROR_LINK] GraphQL 에러 감지: ${message}`);
      
      // Bearer Token 에러인 경우 사용자 친화적인 메시지로 처리
      if (message.includes('Bearer Token') || message.includes('not provided')) {
        console.log(`[AUTH] Bearer Token 에러 감지: ${operation.operationName}`);
        // 개발 환경에서는 에러를 조용히 처리하고, 프로덕션에서는 로그인 안내
        if (process.env.NODE_ENV === 'production') {
          // 프로덕션에서는 로그인 페이지로 리다이렉트하지 않고 조용히 처리
          console.log('Bearer Token 에러 - 사용자가 로그인하지 않음');
        }
        return; // 에러를 무시하고 계속 진행
      }
      
      // 개발 환경에서는 에러 로깅만 하고 조용히 처리
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] GraphQL 에러 무시: ${message} (${operation.operationName})`);
        return;
      }
      
      // 프로덕션 환경에서만 다른 에러들 처리
      console.error(
        `GraphQL 에러: ${message}`,
        `위치: ${locations}`,
        `경로: ${path}`,
        `작업: ${operation.operationName}`
      );
      sweetErrorAlert(`GraphQL 에러: ${message}`);
    });
  }

  if (networkError) {
    console.log(`[ERROR_LINK] 네트워크 에러 감지:`, networkError);
    console.log(`[ERROR_LINK] 네트워크 에러 메시지: ${networkError.message}`);
    // statusCode가 존재하는지 확인 후 로깅
    if ('statusCode' in networkError) {
      console.log(`[ERROR_LINK] 네트워크 에러 상태:`, networkError.statusCode);
    }
    
    // 개발 환경에서는 네트워크 에러도 조용히 처리
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] 네트워크 에러 무시: ${networkError.message} (${operation.operationName})`);
      return;
    }
    
    console.error('네트워크 에러:', networkError);
    console.error('네트워크 에러 작업:', operation.operationName);
    
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // 인증 에러 처리
      console.log('401 에러 발생');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        safeRedirect('/login');
      }
    } else {
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
        errorPolicy: 'ignore', // 개발 환경에서 에러 무시
        fetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: false,
        pollInterval: 0, // 폴링 완전 비활성화
        // 개발 환경에서 추가 안정성 설정
        ...(process.env.NODE_ENV === 'development' && {
          errorPolicy: 'ignore', // 개발 환경에서는 에러를 무시
        }),
      },
      query: {
        errorPolicy: 'ignore', // 개발 환경에서 에러 무시
        fetchPolicy: 'cache-first',
        // 개발 환경에서 추가 안정성 설정
        ...(process.env.NODE_ENV === 'development' && {
          errorPolicy: 'ignore', // 개발 환경에서는 에러를 무시
        }),
      },
      mutate: {
        errorPolicy: 'ignore', // 개발 환경에서 에러 무시
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
