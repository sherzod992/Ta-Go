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
      // 목업 데이터 반환
      return {
        list: [
          {
            _id: '1',
            articleCategory: 'FREE',
            articleStatus: 'ACTIVE',
            articleTitle: '오토바이 구매 팁',
            articleContent: '오토바이 구매시 주의사항들...',
            articleImage: '',
            articleViews: 150,
            articleLikes: 25,
            articleComments: 8,
            memberId: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            memberData: {
              id: '1',
              username: '김바이커',
              email: 'biker@example.com'
            }
          }
        ],
        metaCounter: [{ total: 1 }]
      };
    },
    getBoardArticle: (_, { articleId }) => {
      return {
        _id: articleId,
        articleCategory: 'FREE',
        articleStatus: 'ACTIVE',
        articleTitle: '오토바이 구매 팁',
        articleContent: '오토바이 구매시 주의사항들...',
        articleImage: '',
        articleViews: 150,
        articleLikes: 25,
        articleComments: 8,
        memberId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        memberData: {
          id: '1',
          username: '김바이커',
          email: 'biker@example.com'
        }
      };
    },
    getUnreadMessageCount: () => {
      return 0; // 목업 데이터
    },
    properties: () => [
      {
        id: '1',
        title: 'Honda CB650R',
        description: '완벽한 도시 라이딩을 위한 스포츠 바이크',
        price: 12000000,
        location: '서울',
        type: 'MOTORCYCLE',
        images: ['honda1.jpg', 'honda2.jpg'],
        features: ['ABS', 'LED 조명', '디지털 계기판'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: {
          id: '1',
          username: '김바이커',
          email: 'biker@example.com'
        }
      },
      {
        id: '2',
        title: 'BMW R1250GS',
        description: '장거리 투어링에 최적화된 어드벤처 바이크',
        price: 25000000,
        location: '부산',
        type: 'MOTORCYCLE',
        images: ['bmw1.jpg', 'bmw2.jpg'],
        features: ['전자 서스펜션', '크루즈 컨트롤', '히팅 그립'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: {
          id: '2',
          username: '박투어러',
          email: 'tourer@example.com'
        }
      },
      {
        id: '3',
        title: 'Ducati Panigale V4',
        description: '트랙 성능에 특화된 슈퍼스포츠 바이크',
        price: 35000000,
        location: '대구',
        type: 'MOTORCYCLE',
        images: ['ducati1.jpg', 'ducati2.jpg'],
        features: ['V4 엔진', '트랙 모드', '퀵시프터'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: {
          id: '3',
          username: '이스피드',
          email: 'speed@example.com'
        }
      }
    ],
    property: (_, { id }) => {
      const properties = [
        {
          id: '1',
          title: 'Honda CB650R',
          description: '완벽한 도시 라이딩을 위한 스포츠 바이크',
          price: 12000000,
          location: '서울',
          type: 'MOTORCYCLE',
          images: ['honda1.jpg', 'honda2.jpg'],
          features: ['ABS', 'LED 조명', '디지털 계기판'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          owner: {
            id: '1',
            username: '김바이커',
            email: 'biker@example.com'
          }
        }
      ];
      return properties.find(p => p.id === id);
    },
    searchProperties: (_, { keyword }) => {
      const properties = [
        {
          id: '1',
          title: 'Honda CB650R',
          description: '완벽한 도시 라이딩을 위한 스포츠 바이크',
          price: 12000000,
          location: '서울',
          type: 'MOTORCYCLE',
          images: ['honda1.jpg', 'honda2.jpg'],
          features: ['ABS', 'LED 조명', '디지털 계기판'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          owner: {
            id: '1',
            username: '김바이커',
            email: 'biker@example.com'
          }
        }
      ];
      return properties.filter(p =>
        p.title.toLowerCase().includes(keyword.toLowerCase()) ||
        p.description.toLowerCase().includes(keyword.toLowerCase())
      );
    },
    getPropertiesByType: (_, { type }) => {
      const properties = [
        {
          id: '1',
          title: 'Honda CB650R',
          description: '완벽한 도시 라이딩을 위한 스포츠 바이크',
          price: 12000000,
          location: '서울',
          type: 'MOTORCYCLE',
          images: ['honda1.jpg', 'honda2.jpg'],
          features: ['ABS', 'LED 조명', '디지털 계기판'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          owner: {
            id: '1',
            username: '김바이커',
            email: 'biker@example.com'
          }
        }
      ];
      return properties.filter(p => p.type === type);
    },
    users: () => [
      {
        id: '1',
        username: '김바이커',
        email: 'biker@example.com',
        phone: '010-1234-5678',
        avatar: 'avatar1.jpg',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        username: '박투어러',
        email: 'tourer@example.com',
        phone: '010-2345-6789',
        avatar: 'avatar2.jpg',
        createdAt: new Date().toISOString()
      }
    ]
  },
  Mutation: {
    createProperty: (_, { input }) => ({
      id: Date.now().toString(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: {
        id: '1',
        username: '김바이커',
        email: 'biker@example.com'
      }
    }),
    updateProperty: (_, { id, input }) => ({
      id,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: {
        id: '1',
        username: '김바이커',
        email: 'biker@example.com'
      }
    }),
    deleteProperty: () => true,
    createUser: (_, { input }) => ({
      id: Date.now().toString(),
      ...input,
      createdAt: new Date().toISOString()
    }),
    updateUser: (_, { id, input }) => ({
      id,
      ...input,
      createdAt: new Date().toISOString()
    }),
    deleteUser: () => true
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
