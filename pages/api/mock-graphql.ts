import { NextApiRequest, NextApiResponse } from 'next';

// Mock 데이터
const mockProperties = [
  {
    id: '1',
    title: 'BMW R 1250 GS',
    price: 25000000,
    description: 'Adventure touring motorcycle',
    images: ['/img/typeImages/ADVENTUREmoto.webp'],
    type: 'ADVENTURE',
    engine: '1250cc',
    year: 2023,
    mileage: 5000,
    location: 'Seoul',
    seller: {
      id: '1',
      name: 'BMW Motorrad Korea',
      rating: 4.8
    }
  },
  {
    id: '2',
    title: 'Honda CBR1000RR',
    price: 18000000,
    description: 'Sport motorcycle',
    images: ['/img/typeImages/standart-naket.avif'],
    type: 'SPORT',
    engine: '1000cc',
    year: 2022,
    mileage: 3000,
    location: 'Busan',
    seller: {
      id: '2',
      name: 'Honda Korea',
      rating: 4.6
    }
  }
];

const mockArticles = [
  {
    id: '1',
    title: '2024년 최고의 모터사이클 트렌드',
    content: '전기 모터사이클과 자율주행 기술이 주목받고 있습니다.',
    author: {
      id: '1',
      name: '모터사이클 전문가'
    },
    createdAt: '2024-01-15T10:00:00Z',
    likes: 45,
    comments: 12
  },
  {
    id: '2',
    title: '초보자를 위한 모터사이클 구매 가이드',
    content: '첫 모터사이클을 구매할 때 고려해야 할 사항들을 정리했습니다.',
    author: {
      id: '2',
      name: '라이딩 강사'
    },
    createdAt: '2024-01-14T15:30:00Z',
    likes: 32,
    comments: 8
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { query, variables } = req.body;

    // GraphQL 쿼리 파싱 (간단한 방식)
    if (query.includes('GetProperties')) {
      return res.status(200).json({
        data: {
          properties: mockProperties
        }
      });
    }

    if (query.includes('GetBoardArticles')) {
      return res.status(200).json({
        data: {
          articles: mockArticles
        }
      });
    }

    if (query.includes('GetProperty')) {
      const { id } = variables || {};
      const property = mockProperties.find(p => p.id === id);
      
      if (property) {
        return res.status(200).json({
          data: {
            property
          }
        });
      }
    }

    // 기본 응답
    return res.status(200).json({
      data: {
        message: 'Mock API is working'
      }
    });

  } catch (error) {
    console.error('Mock API Error:', error);
    return res.status(500).json({
      errors: [{
        message: 'Internal server error'
      }]
    });
  }
}

