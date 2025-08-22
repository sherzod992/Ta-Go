// Mock API 설정
export const MOCK_API_CONFIG = {
  enabled: true,
  delay: 500, // 응답 지연 시간 (ms)
  endpoints: {
    graphql: '/api/mock/graphql',
    properties: '/api/mock/properties',
    members: '/api/mock/members',
    articles: '/api/mock/articles',
    chat: '/api/mock/chat'
  }
};

// Mock 데이터
export const MOCK_DATA = {
  properties: [
    {
      id: '1',
      title: '2020 Honda CBR1000RR',
      price: 15000000,
      location: '서울시 강남구',
      images: ['/mock-images/bike1.jpg'],
      description: '완벽한 상태의 스포츠바이크',
      seller: {
        id: '1',
        name: '김바이커',
        rating: 4.8
      }
    },
    {
      id: '2',
      title: '2019 Yamaha MT-09',
      price: 12000000,
      location: '부산시 해운대구',
      images: ['/mock-images/bike2.jpg'],
      description: '도시 주행에 최적화된 네이키드',
      seller: {
        id: '2',
        name: '이라이더',
        rating: 4.5
      }
    }
  ],
  articles: [
    {
      id: '1',
      title: '오토바이 구매 시 체크포인트',
      content: '안전하고 합리적인 오토바이 구매를 위한 가이드...',
      author: '김바이커',
      createdAt: '2024-01-15',
      likes: 42,
      comments: 8
    },
    {
      id: '2',
      title: '신규 라이더를 위한 팁',
      content: '처음 오토바이를 타는 분들을 위한 조언...',
      author: '이라이더',
      createdAt: '2024-01-14',
      likes: 38,
      comments: 12
    }
  ],
  members: [
    {
      id: '1',
      name: '김바이커',
      email: 'biker@example.com',
      rating: 4.8,
      propertiesCount: 3,
      joinDate: '2023-01-01'
    },
    {
      id: '2',
      name: '이라이더',
      email: 'rider@example.com',
      rating: 4.5,
      propertiesCount: 1,
      joinDate: '2023-06-15'
    }
  ]
};
