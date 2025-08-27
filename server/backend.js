const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { gql } = require('apollo-server-express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정 (모든 origin 허용)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-apollo-operation-name', 'apollo-require-preflight', 'x-requested-with', 'x-apollo-tracing']
}));

// JSON 파서 설정
app.use(express.json());

// Helmet 비활성화 (CORS 문제 해결을 위해)
// app.use(helmet());

// GraphQL 스키마 정의
const typeDefs = gql`
  type Query {
    hello: String
    properties: [Property]
    users: [User]
  }

  type Mutation {
    createProperty(input: PropertyInput): Property
    updateProperty(id: ID!, input: PropertyInput): Property
    deleteProperty(id: ID!): Boolean
  }

  type Property {
    id: ID!
    title: String!
    description: String
    price: Float
    location: String
    createdAt: String
  }

  type User {
    id: ID!
    username: String!
    email: String!
  }

  input PropertyInput {
    title: String!
    description: String
    price: Float
    location: String
  }
`;

// 리졸버 정의
const resolvers = {
  Query: {
    hello: () => 'Hello from ta-Go Backend!',
    properties: () => [
      {
        id: '1',
        title: 'Honda CB650R',
        description: '완벽한 도시 라이딩을 위한 스포츠 바이크',
        price: 12000000,
        location: '서울',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'BMW R1250GS',
        description: '장거리 투어링에 최적화된 어드벤처 바이크',
        price: 25000000,
        location: '부산',
        createdAt: new Date().toISOString()
      }
    ],
    users: () => [
      {
        id: '1',
        username: '김바이커',
        email: 'biker@example.com'
      }
    ]
  },
  Mutation: {
    createProperty: (_, { input }) => ({
      id: Date.now().toString(),
      ...input,
      createdAt: new Date().toISOString()
    }),
    updateProperty: (_, { id, input }) => ({
      id,
      ...input,
      createdAt: new Date().toISOString()
    }),
    deleteProperty: () => true
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
    path: '/graphql'
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
