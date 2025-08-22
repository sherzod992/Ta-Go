# 백엔드 서버 문제 해결 가이드

## 현재 상황
- 서버: 온라인 ✅
- Nginx: 정상 동작 ✅
- MongoDB: 정상 동작 ✅
- PM2 프로세스: 실행 중 ✅
- API 서버: MongoDB 연결 오류로 인해 포트 3000 미동작 ⚠️

## 문제 원인
백엔드 애플리케이션의 환경 변수 로딩 문제로 인해 MongoDB 연결이 실패하고 있습니다.

## 해결 방법

### 1. 서버에 SSH 접속
```bash
ssh root@72.60.40.57
```

### 2. 백엔드 애플리케이션 디렉토리로 이동
```bash
cd /var/www/backend  # 또는 백엔드 애플리케이션이 설치된 디렉토리
```

### 3. 환경 변수 파일 확인
```bash
ls -la .env*
cat .env
```

### 4. 환경 변수 파일 수정
```bash
nano .env
```

다음 내용이 포함되어 있는지 확인:
```env
# MongoDB 연결 설정
MONGODB_URI=mongodb://localhost:27017/your_database_name
# 또는
MONGODB_URI=mongodb://username:password@localhost:27017/your_database_name

# 서버 설정
PORT=3000
NODE_ENV=production

# JWT 설정
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 기타 필요한 환경 변수들
```

### 5. 임시 해결책: 하드코딩된 MongoDB URI 사용
`app.module.ts` 또는 데이터베이스 설정 파일에서:

```typescript
// 기존 코드
const mongoUri = process.env.MONGODB_URI;

// 임시 해결책
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name';
```

### 6. ConfigService 사용 방식 개선
```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.production'],
      load: [() => ({
        mongodb: {
          uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name',
        },
        port: process.env.PORT || 3000,
        jwt: {
          secret: process.env.JWT_SECRET || 'default_secret',
          expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        },
      })],
    }),
    // ... 기타 모듈들
  ],
})
export class AppModule {}
```

### 7. PM2 프로세스 재시작
```bash
# 현재 프로세스 상태 확인
pm2 status

# 백엔드 프로세스 재시작
pm2 restart [백엔드_앱_이름]

# 또는 모든 프로세스 재시작
pm2 restart all

# 로그 확인
pm2 logs [백엔드_앱_이름]
```

### 8. MongoDB 연결 테스트
```bash
# MongoDB 서비스 상태 확인
systemctl status mongod

# MongoDB 연결 테스트
mongo --eval "db.runCommand('ping')"
```

### 9. 포트 확인
```bash
# 3000번 포트 사용 중인 프로세스 확인
netstat -tlnp | grep :3000

# 또는
lsof -i :3000
```

### 10. 방화벽 설정 확인
```bash
# UFW 상태 확인
ufw status

# 3000번 포트 허용 (필요한 경우)
ufw allow 3000
```

## 디버깅 명령어

### PM2 로그 확인
```bash
pm2 logs --lines 100
```

### 환경 변수 확인
```bash
# Node.js에서 환경 변수 출력
node -e "console.log(process.env.MONGODB_URI)"
```

### 애플리케이션 직접 실행
```bash
# PM2 없이 직접 실행하여 오류 확인
npm start
# 또는
node dist/main.js
```

## 예상 결과
위 단계들을 완료하면:
1. 환경 변수가 올바르게 로드됨
2. MongoDB 연결이 성공함
3. API 서버가 포트 3000에서 정상 동작함
4. 프론트엔드에서 백엔드 API 호출이 가능해짐

## 추가 확인사항
- `/backend-status` 페이지에서 백엔드 연결 상태 확인
- 브라우저 개발자 도구에서 네트워크 요청 확인
- 서버 로그에서 오류 메시지 확인
