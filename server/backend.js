const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { gql } = require('apollo-server-express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정 (개발 환경 고려)
const allowedOrigins = [
  'http://72.60.40.57:3011',
  'http://localhost:3011',
  'http://localhost:3000',
  'http://127.0.0.1:3011',
  'http://127.0.0.1:3000',
  'http://72.60.40.57', // 메인 도메인 추가
  // 개발 환경에서 추가 허용
  ...(process.env.NODE_ENV === 'development' ? [
    'http://localhost:*',
    'http://127.0.0.1:*'
  ] : [])
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: false, // credentials를 false로 설정하여 CORS 오류 방지
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-apollo-operation-name', 'apollo-require-preflight', 'x-requested-with', 'x-apollo-tracing'],
  maxAge: 86400
};

app.use(cors(corsOptions));

// CORS 미들웨어 (단순화)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    console.log('CORS: 허용된 origin으로 요청 처리:', origin);
  }
  next();
});

// JSON 파서 설정 - 요청 크기 제한 증가 (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helmet 비활성화 (CORS 문제 해결을 위해)
// app.use(helmet());

// GraphQL 엔드포인트는 전역 CORS 설정을 사용합니다

// GraphQL 스키마 정의
const typeDefs = gql`
  type Query {
    hello: String
    properties: [Property]
    users: [User]
    property(id: ID!): Property
    searchProperties(keyword: String): [Property]
    getPropertiesByType(type: PropertyType): [Property]
    getBoardArticles(input: BoardArticlesInquiry!): BoardArticles
    getBoardArticle(articleId: String!): BoardArticle
    getUnreadMessageCount: Int
  }

  type Mutation {
    createProperty(input: PropertyInput): Property
    updateProperty(id: ID!, input: PropertyInput): Property
    deleteProperty(id: ID!): Boolean
    createUser(input: UserInput): User
    updateUser(id: ID!, input: UserInput): User
    deleteUser(id: ID!): Boolean
  }

  type Property {
    id: ID!
    title: String!
    description: String
    price: Float
    location: String
    type: PropertyType
    images: [String]
    features: [String]
    createdAt: String
    updatedAt: String
    owner: User
  }

  type User {
    id: ID!
    username: String!
    email: String!
    phone: String
    avatar: String
    createdAt: String
    updatedAt: String
    deletedAt: String
    properties: [Property]
    memberPoints: Int
    memberLikes: Int
    memberViews: Int
    memberComments: Int
    memberRank: Int
    memberWarnings: Int
    memberBlocks: Int
    accessToken: String
  }

  type BoardArticle {
    _id: String!
    articleCategory: String
    articleStatus: String
    articleTitle: String!
    articleContent: String
    articleImage: String
    articleViews: Int
    articleLikes: Int
    articleComments: Int
    memberId: String
    createdAt: String
    updatedAt: String
    memberData: User
  }

  type BoardArticles {
    list: [BoardArticle]
    metaCounter: [TotalCounter]
  }

  type TotalCounter {
    total: Int
  }

  input BoardArticlesInquiry {
    page: Int
    limit: Int
    sort: String
    direction: String
    search: BAISearch
  }

  input BAISearch {
    articleCategory: String
    text: String
  }

  enum PropertyType {
    MOTORCYCLE
    CAR
    HOUSE
    LAND
    COMMERCIAL
  }

  input PropertyInput {
    title: String!
    description: String
    price: Float
    location: String
    type: PropertyType
    images: [String]
    features: [String]
  }

  input UserInput {
    username: String!
    email: String!
    phone: String
    avatar: String
  }
`;

// 리졸버 정의
const resolvers = {
  Query: {
    hello: () => 'Hello from ta-Go Backend!',
    getBoardArticles: (_, { input }) => {
      // TODO: 실제 데이터베이스에서 데이터 조회
      return {
        list: [],
        metaCounter: [{ total: 0 }]
      };
    },
    getBoardArticle: (_, { articleId }) => {
      // TODO: 실제 데이터베이스에서 데이터 조회
      return null;
    },
    getUnreadMessageCount: () => {
      // TODO: 실제 데이터베이스에서 데이터 조회
      return 0;
    },
    properties: () => {
      // TODO: 실제 데이터베이스에서 데이터 조회
      return [];
    },
    property: (_, { id }) => {
      // TODO: 실제 데이터베이스에서 데이터 조회
      return null;
    },
    searchProperties: (_, { keyword }) => {
      // TODO: 실제 데이터베이스에서 데이터 조회
      return [];
    },
    getPropertiesByType: (_, { type }) => {
      // TODO: 실제 데이터베이스에서 데이터 조회
      return [];
    },
    users: () => {
      // TODO: 실제 데이터베이스에서 데이터 조회
      return [];
    }
  },
  Mutation: {
    createProperty: (_, { input }) => {
      // TODO: 실제 데이터베이스에 데이터 저장
      return null;
    },
    updateProperty: (_, { id, input }) => {
      // TODO: 실제 데이터베이스에서 데이터 업데이트
      return null;
    },
    deleteProperty: () => {
      // TODO: 실제 데이터베이스에서 데이터 삭제
      return false;
    },
    createUser: (_, { input }) => {
      // TODO: 실제 데이터베이스에 사용자 저장
      return null;
    },
    updateUser: (_, { id, input }) => {
      // TODO: 실제 데이터베이스에서 사용자 업데이트
      return null;
    },
    deleteUser: () => {
      // TODO: 실제 데이터베이스에서 사용자 삭제
      return false;
    }
  }
};

// Apollo Server 설정
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

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ta-Go Backend API',
    version: '1.0.0'
  });
});

// GraphQL 엔드포인트
app.get('/graphql', (req, res) => {
  res.send('ta-Go GraphQL API is running!');
});

async function startServer() {
  await server.start();

  server.applyMiddleware({
    app,
    path: '/graphql',
    bodyParserConfig: {
      limit: '50mb'
    },
    cors: false, // Apollo Server의 CORS 비활성화 (Express CORS 사용)
    disableHealthCheck: true
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ta-Go Backend Server running on port ${PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
  });
}

// 에러 핸들링
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer().catch(console.error);
