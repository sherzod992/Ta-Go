import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { useTranslation } from '../../libs/hooks/useTranslation';
import LoadingSpinner from '../../libs/components/common/LoadingSpinner';

const PropertyPage: NextPage = () => {
  const router = useRouter();
  const { type } = router.query;
  const device = useDeviceDetect();
  const { t } = useTranslation();

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

  // 로딩 중 표시
  return (
    <LoadingSpinner
      message={t('Redirecting...')}
      fullScreen={true}
      variant="dots"
    />
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

export default withLayoutBasic(PropertyPage); 