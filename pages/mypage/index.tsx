import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Grid, CircularProgress, Typography } from '@mui/material';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { MemberType } from '../../libs/enums/member.enum';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyMenu from '../../libs/components/mypage/MyMenu';
import MyProperties from '../../libs/components/mypage/MyProperties';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import MyArticles from '../../libs/components/mypage/MyArticles';
import MyProfile from '../../libs/components/mypage/MyProfile';
import ChatListPage from './chat/index';
import { getJwtToken, updateUserInfo } from '../../libs/auth';

const MyPage: React.FC = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const category = (router.query.category as string) || 'profile';
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 정보 로딩 및 복원
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // JWT 토큰이 있으면 사용자 정보 복원
        const jwt = getJwtToken();
        if (jwt) {
          updateUserInfo(jwt);
        }
      } catch (error) {
        console.error('사용자 정보 복원 실패:', error);
      } finally {
        // 0.5초 후 로딩 완료
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    // 로딩이 완료된 후에만 리다이렉트 체크
    if (!isLoading && (!user || !user._id)) {
      router.replace('/');
    }
  }, [user, router, isLoading]);

  useEffect(() => {
    const agentOnly = ['add', 'properties'];
    if (agentOnly.includes(category) && user?.memberType !== MemberType.AGENT) {
      router.replace('/mypage?category=profile');
    }
  }, [category, user, router]);

  const Content = useMemo(() => {
    switch (category) {
      case 'add':
        // AddNewProperty 컴포넌트는 업로드 스펙 확정 후 추가 예정
        return <MyProperties mode="create" />;
      case 'properties':
        return <MyProperties />;
      case 'favorites':
        return <MyFavorites />;
      case 'visited':
        return <RecentlyVisited />;
      case 'articles':
        return <MyArticles />;
      case 'chat':
        return <ChatListPage />;
      case 'profile':
      default:
        return <MyProfile />;
    }
  }, [category]);

  // 로딩 중일 때 로딩 화면 표시
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '50vh',
        px: 2, 
        py: 3 
      }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          사용자 정보를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  // 사용자 정보가 없으면 null 반환 (리다이렉트는 useEffect에서 처리)
  if (!user || !user._id) return null;

  return (
    <Box sx={{ px: 2, py: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3} lg={2}>
          <MyMenu active={category} />
        </Grid>
        <Grid item xs={12} md={9} lg={10}>
          {Content}
        </Grid>
      </Grid>
    </Box>
  );
};

export default withLayoutBasic(MyPage);


