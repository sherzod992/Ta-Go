import { MOCK_DATA } from '../../../mock-api-config';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query } = req.body;

  // GraphQL 쿼리 파싱 (간단한 구현)
  if (query.includes('GetProperties')) {
    return res.status(200).json({
      data: {
        properties: MOCK_DATA.properties
      }
    });
  }

  if (query.includes('GetBoardArticles')) {
    return res.status(200).json({
      data: {
        boardArticles: MOCK_DATA.articles
      }
    });
  }

  if (query.includes('GetMembers')) {
    return res.status(200).json({
      data: {
        members: MOCK_DATA.members
      }
    });
  }

  // 기본 스키마 응답
  return res.status(200).json({
    data: {
      __schema: {
        types: [
          { name: 'Property' },
          { name: 'BoardArticle' },
          { name: 'Member' },
          { name: 'Query' },
          { name: 'Mutation' }
        ]
      }
    }
  });
}
