import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack, Typography, Box } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { 
  preventInfiniteLoop, 
  resetLoopCounter, 
  preventExcessiveMounts, 
  resetMountCounter 
} from '../../utils/security';

const withLayoutBasic = (Component: any) => {
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
		}, [router.pathname, router.locale]);

		/** LIFECYCLES **/
		useEffect(() => {
			// 클라이언트에서만 실행
			if (typeof window !== 'undefined') {
				try {
					const jwt = getJwtToken();
					if (jwt) updateUserInfo(jwt);
				} catch (error) {
					console.error('인증 처리 중 오류:', error);
				}
			}
		}, []);

		/** HANDLERS **/

		if (device.isMobile) {
			return (
				<>
					<Head>
						<title>ta-Go - {memoizedValues.title}</title>
						<meta name={'title'} content={`ta-Go - ${memoizedValues.title}`} />
						<meta name={'description'} content={memoizedValues.desc} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
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
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack
							className={`header-basic ${authHeader && 'auth'}`}
							sx={{
								backgroundImage: `url(${memoizedValues.bgImage})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								position: 'relative',
								py: 6,
								'&::before': {
									content: '""',
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									backgroundColor: 'rgba(0, 0, 0, 0.5)',
								}
							}}
						>
							<Box
								className={'container'}
								sx={{
									position: 'relative',
									zIndex: 1,
									textAlign: 'center',
									color: 'white',
									maxWidth: '1200px',
									margin: '0 auto',
									px: 2,
								}}
							>
								<Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
									{memoizedValues.title}
								</Typography>
								<Typography variant="h5" sx={{ opacity: 0.9 }}>
									{memoizedValues.desc}
								</Typography>
							</Box>
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
