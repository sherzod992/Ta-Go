import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const endpoints = [
    { name: 'Nginx (포트 3000)', url: 'http://72.60.40.57:3000/graphql' },
    { name: '직접 API (포트 3012)', url: 'http://72.60.40.57:3012/graphql' },
    { name: '로컬 API (포트 3012)', url: 'http://localhost:3012/graphql' }
  ];

  const results: any[] = [];

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '{ __typename }'
        }),
        signal: AbortSignal.timeout(5000) // 5초 타임아웃
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        results.push({
          name: endpoint.name,
          status: 'connected',
          url: endpoint.url,
          responseTime: `${responseTime}ms`,
          data: data
        });
      } else {
        results.push({
          name: endpoint.name,
          status: 'connected_but_error',
          url: endpoint.url,
          statusCode: response.status,
          error: `HTTP ${response.status}: ${response.statusText}`
        });
      }
    } catch (error: any) {
      results.push({
        name: endpoint.name,
        status: 'disconnected',
        url: endpoint.url,
        error: error.message || 'Connection failed'
      });
    }
  }

  // 가장 좋은 상태의 엔드포인트 찾기
  const bestEndpoint = results.find(r => r.status === 'connected') || 
                      results.find(r => r.status === 'connected_but_error') ||
                      results[0];

  res.status(200).json({
    status: 'success',
    endpoints: results,
    bestEndpoint: bestEndpoint,
    timestamp: new Date().toISOString()
  });
}
