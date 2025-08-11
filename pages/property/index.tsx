import React from 'react';
import { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import BuyPageMobile from '../../libs/components/buy/BuyPageMobile';
import BuyPageDesktop from '../../libs/components/buy/BuyPageDesktop';

const PropertyPage: NextPage = () => {
  const router = useRouter();
  const { type } = router.query;
  const device = useDeviceDetect();

  useEffect(() => {
    // Sell 버튼을 눌렀을 때 새로운 sell 페이지로 리다이렉트
    if (type === 'sell') {
      router.replace('/sell');
    }
    // Buy 버튼을 눌렀을 때 새로운 buy 페이지로 리다이렉트
    if (type === 'buy' || !type) {
      router.replace('/buy');
    }
  }, [type, router]);

  // Buy 페이지인 경우 디바이스에 따라 컴포넌트 렌더링
  if (type === 'buy' || !type) {
    if (device === 'mobile') {
      return <BuyPageMobile />;
    }
    return <BuyPageDesktop />;
  }

  // 로딩 중 표시
  return <div>Redirecting...</div>;
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common'])),
    },
  };
};

export default withLayoutBasic(PropertyPage); 