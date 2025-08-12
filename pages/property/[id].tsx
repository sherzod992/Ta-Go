import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { PropertyDetail } from '../../libs/components/property/PropertyDetail';

const PropertyDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // 로딩 중이거나 ID가 없으면 로딩 표시
  if (router.isFallback || !id) {
    return <div>Loading...</div>;
  }

  return <PropertyDetail propertyId={id as string} />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common'])),
    },
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default withLayoutBasic(PropertyDetailPage); 