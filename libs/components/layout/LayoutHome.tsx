import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import { 
  preventInfiniteLoop, 
  resetLoopCounter, 
  preventExcessiveMounts, 
  resetMountCounter 
} from '../../utils/security';

const withLayoutHome = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);

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
						<title>ta-Go - Home</title>
						<meta name={'title'} content={`ta-Go - Find your next bike`} />
						<meta name={'description'} content={`Discover the perfect motorcycle for your adventure`} />
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
						<title>ta-Go - Home</title>
						<meta name={'title'} content={`ta-Go - Find your next bike`} />
						<meta name={'description'} content={`Discover the perfect motorcycle for your adventure`} />
					</Head>
					<Stack id="pc-wrap">
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
		}
	};
};

export default withLayoutHome;
