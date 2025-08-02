import { useMemo } from "react";
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  split,
  from,
  NormalizedCacheObject,
} from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { onError } from "@apollo/client/link/error";
import { getJwtToken } from "../libs/auth";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import { sweetErrorAlert } from "../libs/types/sweetAlert"
import { socketVar } from "./store";

let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		return true;
	}, // @ts-ignore
	fetchAccessToken: () => {
		// execute refresh token
		return null;
	},
});

// Custom WebSocket client
class LoggingWebSocket {
	private socket: WebSocket;

	constructor(url: string) {
		this.socket = new WebSocket(`${url}?token=${getJwtToken()}`);
		socketVar(this.socket);

		this.socket.onopen = () => {
			console.log('WebSocket connection!');
		};

		this.socket.onmessage = (msg) => {
			console.log('WebSocket message:', msg.data);
		};

		this.socket.onerror = (error) => {
			console.log('WebSocket, error:', error);
		};
	}

	send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
		this.socket.send(data);
	}

	close() {
		this.socket.close();
	}
}

function createIsomorphicLink() {
	// 서버 사이드에서는 기본 HTTP 링크만 사용
	if (typeof window === 'undefined') {
		const link = createUploadLink({
			uri: process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql',
		});
		return link;
	}

	// 클라이언트 사이드에서는 전체 기능 사용
	if (typeof window !== 'undefined') {
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers,
					...getHeaders(),
				},
			}));
			console.warn('requesting.. ', operation);
			return forward(operation);
		});

		// @ts-ignore
		const link = new createUploadLink({
			uri: process.env.REACT_APP_API_GRAPHQL_URL,
		});

		/* WEBSOCKET SUBSCRIPTION LINK */
		const wsLink = new WebSocketLink({
  uri: process.env.REACT_APP_API_WS ?? 'ws://127.0.0.1:3007/graphql',
  options: {
    reconnect: true,
    connectionParams: () => ({
      Authorization: `Bearer ${getJwtToken()}`
    }),
  },
  // webSocketImpl qo‘lda berilmaydi → default browser WebSocket ishlatiladi
});
		const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors?.length) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
      
      // Agar message undefined bo‘lsa, ishlatmaslik
      if (message && !message.includes("input")) {
        sweetErrorAlert(message);
      }
    });
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
    // @ts-ignore
    if (networkError?.statusCode === 401) {
      // Token xatosi bo‘lsa shu yerda ishlov beriladi
    }
  }
});

		const splitLink = split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			wsLink,
			authLink.concat(link),
		);

		return from([errorLink, tokenRefreshLink, splitLink]);
	}
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
		resolvers: {},
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}