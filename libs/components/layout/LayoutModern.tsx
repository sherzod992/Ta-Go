import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Box, Typography, Container } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

const withLayoutModern = (Component: any) => {
  return (props: any) => {
    const router = useRouter();
    const device = useDeviceDetect();
    const [authHeader, setAuthHeader] = useState<boolean>(false);
    const user = useReactiveVar(userVar);

    const memoizedValues = useMemo(() => {
      let title = '',
        desc = '',
        bgImage = '';

      switch (router.pathname) {
        case '/property':
          title = 'Property Search';
          desc = 'Find your perfect motorcycle';
          bgImage = '/img/home/home2.jpg';
          break;
        case '/agent':
          title = 'Agents';
          desc = 'Connect with motorcycle experts';
          bgImage = '/img/home/home3.jpg';
          break;
        case '/agent/detail':
          title = 'Agent Details';
          desc = 'Learn more about our agents';
          bgImage = '/img/home/home2.jpg';
          break;
        case '/mypage':
          title = 'My Page';
          desc = 'Manage your account';
          bgImage = '/img/home/home1.jpg';
          break;
        case '/community':
          title = 'Community';
          desc = 'Join the motorcycle community';
          bgImage = '/img/home/home3.jpg';
          break;
        case '/community/detail':
          title = 'Community Detail';
          desc = 'Community discussions';
          bgImage = '/img/home/home2.jpg';
          break;
        case '/cs':
          title = 'Customer Service';
          desc = 'We are here to help you';
          bgImage = '/img/home/home1.jpg';
          break;
        case '/login':
          title = 'Login/Signup';
          desc = 'Authentication Process';
          bgImage = '/img/login/login.jpg';
          setAuthHeader(true);
          break;
        case '/member':
          title = 'Member Page';
          desc = 'Member information';
          bgImage = '/img/home/home1.jpg';
          break;
        default:
          title = 'ta-Go';
          desc = 'Motorcycle marketplace';
          bgImage = '/img/home/home1.jpg';
          break;
      }

      return { title, desc, bgImage };
    }, [router.pathname]);

    /** LIFECYCLES **/
    useEffect(() => {
      const jwt = getJwtToken();
      if (jwt) updateUserInfo(jwt);
    }, []);

    if (device.isMobile) {
      return (
        <>
          <Head>
            <title>ta-Go - {memoizedValues.title}</title>
            <meta name={'title'} content={`ta-Go - ${memoizedValues.title}`} />
            <meta name={'description'} content={memoizedValues.desc} />
          </Head>
          <Box className="full-viewport">
            <Box className="fluid-nav">
              <Top />
            </Box>
            <Box className="content">
              <Component {...props} />
            </Box>
            <Footer />
          </Box>
        </>
      );
    } else {
      return (
        <>
          <Head>
            <title>ta-Go - {memoizedValues.title}</title>
            <meta name={'title'} content={`ta-Go - ${memoizedValues.title}`} />
            <meta name={'description'} content={memoizedValues.desc} />
          </Head>
          <Box className="full-viewport">
            <Box className="fluid-nav">
              <Top />
            </Box>
            
            {/* 현대적인 히어로 섹션 */}
            <Box
              className="fluid-hero"
              sx={{
                backgroundImage: `url(${memoizedValues.bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)',
                }
              }}
            >
              <Box
                className="hero-content"
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  color: 'white',
                }}
              >
                <Typography 
                  variant="h1" 
                  component="h1" 
                  className="fluid-heading"
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  {memoizedValues.title}
                </Typography>
                <Typography 
                  variant="h4" 
                  className="fluid-text"
                  sx={{ 
                    opacity: 0.9,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  {memoizedValues.desc}
                </Typography>
              </Box>
            </Box>

            <Box className="content">
              <Component {...props} />
            </Box>
            
            <Footer />
          </Box>
        </>
      );
    }
  };
};

export default withLayoutModern;
