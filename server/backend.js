const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const helmet = require('helmet');

// GraphQL 스키마 정의
const typeDefs = `
  type Query {
    hello: String
    properties: [Property]
    boardArticles: [BoardArticle]
    unreadMessageCount: Int
  }

  type Property {
    id: ID!
    title: String
    description: String
    price: Float
    location: String
    manufacturedAt: String
    createdAt: String
    updatedAt: String
  }

  type BoardArticle {
    id: ID!
    title: String
    content: String
    author: String
    createdAt: String
  }

  type Member {
    id: ID!
    email: String
    nickname: String
    createdAt: String
  }

  type LoginResponse {
    success: Boolean!
    message: String
    token: String
    member: Member
  }

  type Mutation {
    createProperty(input: PropertyInput!): Property
    createBoardArticle(input: BoardArticleInput!): BoardArticle
    login(input: LoginInput!): LoginResponse
    signup(input: SignupInput!): LoginResponse
  }

  input PropertyInput {
    title: String!
    description: String
    price: Float
    location: String
    manufacturedAt: String
  }

  input BoardArticleInput {
    title: String!
    content: String!
    author: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input SignupInput {
    email: String!
    password: String!
    nickname: String!
  }
`;

// 리졸버 정의
const resolvers = {
    Query: {
        hello: () => 'Hello from Ta-Go Backend!',
        properties: () => [
            {
                id: '1',
                title: '샘플 부동산 1',
                description: '샘플 부동산 설명입니다.',
                price: 50000000,
                location: '서울시 강남구'
            },
            {
                id: '2',
                title: '샘플 부동산 2',
                description: '샘플 부동산 설명입니다.',
                price: 30000000,
                location: '서울시 서초구'
            }
        ],
        boardArticles: () => [
            {
                id: '1',
                title: '샘플 게시글 1',
                content: '샘플 게시글 내용입니다.',
                author: '작성자1',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                title: '샘플 게시글 2',
                content: '샘플 게시글 내용입니다.',
                author: '작성자2',
                createdAt: new Date().toISOString()
            }
        ],
        unreadMessageCount: () => 0
    },
    Mutation: {
        createProperty: (_, { input }) => {
            console.log('Property creation input:', input);
            const now = new Date().toISOString();
            return {
                id: Date.now().toString(),
                ...input,
                manufacturedAt: input.manufacturedAt || now,
                createdAt: now,
                updatedAt: now
            };
        },
        createBoardArticle: (_, { input }) => ({
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            ...input
        }),
        login: (_, { input }) => {
            console.log('Login attempt:', input.email);
            // 임시 로그인 로직 (실제로는 데이터베이스 검증 필요)
            if (input.email && input.password) {
                const mockToken = `mock-jwt-token-${Date.now()}`;
                return {
                    success: true,
                    message: '로그인 성공',
                    token: mockToken,
                    member: {
                        id: '1',
                        email: input.email,
                        nickname: '사용자',
                        createdAt: new Date().toISOString()
                    }
                };
            } else {
                return {
                    success: false,
                    message: '이메일과 비밀번호를 입력해주세요',
                    token: null,
                    member: null
                };
            }
        },
        signup: (_, { input }) => {
            console.log('Signup attempt:', input.email);
            // 임시 회원가입 로직 (실제로는 데이터베이스 저장 필요)
            if (input.email && input.password && input.nickname) {
                const mockToken = `mock-jwt-token-${Date.now()}`;
                return {
                    success: true,
                    message: '회원가입 성공',
                    token: mockToken,
                    member: {
                        id: Date.now().toString(),
                        email: input.email,
                        nickname: input.nickname,
                        createdAt: new Date().toISOString()
                    }
                };
            } else {
                return {
                    success: false,
                    message: '모든 필드를 입력해주세요',
                    token: null,
                    member: null
                };
            }
        }
    }
};

async function startServer() {
    const app = express();

    // 미들웨어 설정
    app.use(helmet());

    // 요청 크기 제한 설정
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    app.use(cors({
        origin: ['http://ta-go.shop', 'https://ta-go.shop', 'http://localhost:3000', 'http://72.60.40.57'],
        credentials: true
    }));

    // 헬스체크 엔드포인트
    app.get('/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Apollo Server 생성
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
            // 인증 토큰 처리
            const token = req.headers.authorization || '';
            return { token };
        },
        formatError: (error) => {
            console.error('GraphQL Error:', error);
            return error;
        }
    });

    await server.start();

    // Apollo Server를 Express 앱에 연결
    server.applyMiddleware({
        app,
        path: '/graphql',
        cors: {
            origin: ['http://ta-go.shop', 'https://ta-go.shop', 'http://localhost:3000', 'http://72.60.40.57'],
            credentials: true
        }
    });

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`🚀 Ta-Go Backend Server running on port ${PORT}`);
        console.log(`📊 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
}

startServer().catch(console.error);
