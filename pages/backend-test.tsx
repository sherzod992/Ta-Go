import { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';

// 간단한 GraphQL 쿼리
const TEST_QUERY = gql`
  query TestConnection {
    __schema {
      types {
        name
      }
    }
  }
`;

export default function BackendTest() {
  const client = useApolloClient();
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testBackendConnection = async () => {
    setLoading(true);
    setError('');
    setTestResult('');

    try {
      console.log('🔧 백엔드 연결 테스트 시작...');
      
      const result = await client.query({
        query: TEST_QUERY,
        fetchPolicy: 'network-only', // 캐시 무시하고 네트워크에서 직접 가져오기
      });

      console.log('✅ 백엔드 연결 성공:', result);
      setTestResult(JSON.stringify(result.data, null, 2));
    } catch (err: any) {
      console.error('❌ 백엔드 연결 실패:', err);
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 페이지 로드 시 자동으로 테스트 실행
    testBackendConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 백엔드 연결 테스트</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>📋 연결 정보</h2>
        <ul>
          <li><strong>백엔드 API:</strong> http://72.60.40.57:3001</li>
          <li><strong>GraphQL 엔드포인트:</strong> http://72.60.40.57:3001/graphql</li>
          <li><strong>WebSocket:</strong> ws://72.60.40.57:3001</li>
          <li><strong>프론트엔드:</strong> http://localhost:3011</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testBackendConnection}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '테스트 중...' : '연결 테스트'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '5px',
          color: '#721c24',
          marginBottom: '20px'
        }}>
          <h3>❌ 오류</h3>
          <pre>{error}</pre>
        </div>
      )}

      {testResult && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '5px',
          color: '#155724',
          marginBottom: '20px'
        }}>
          <h3>✅ 연결 성공</h3>
          <details>
            <summary>GraphQL 스키마 정보 보기</summary>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '3px',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              {testResult}
            </pre>
          </details>
        </div>
      )}

      <div style={{ 
        padding: '15px', 
        backgroundColor: '#e2e3e5', 
        border: '1px solid #d6d8db', 
        borderRadius: '5px',
        color: '#383d41'
      }}>
        <h3>📊 테스트 결과</h3>
        <p>
          {loading && '🔄 백엔드 연결을 테스트하고 있습니다...'}
          {error && '❌ 백엔드 연결에 실패했습니다.'}
          {testResult && '✅ 백엔드 연결이 성공했습니다!'}
        </p>
      </div>
    </div>
  );
}
