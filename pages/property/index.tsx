import React from 'react';
import { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PropertyCreateForm from '../../libs/components/property/PropertyCreateForm';
import PropertyBuyList from '../../libs/components/property/PropertyBuyList';

const PropertyPage: NextPage = () => {
  const router = useRouter();
  const { type } = router.query;

  // Sell 버튼을 눌렀을 때 매물 등록 페이지 표시
  if (type === 'sell') {
    return (
      <div style={{ padding: '2rem' }}>
        <PropertyCreateForm />
      </div>
    );
  }

  // Buy 버튼을 눌렀을 때는 새로운 구매 목록 페이지 표시
  return <PropertyBuyList />;
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common'])),
    },
  };
};

export default withLayoutBasic(PropertyPage); 