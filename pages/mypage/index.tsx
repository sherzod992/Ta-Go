import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Box, Grid } from '@mui/material';
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

const MyPage: React.FC = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const category = (router.query.category as string) || 'profile';

  useEffect(() => {
    if (!user || !user._id) {
      router.replace('/');
    }
  }, [user, router]);

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


