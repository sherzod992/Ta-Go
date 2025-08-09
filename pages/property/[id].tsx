import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PropertyDetail from '../../libs/components/property/PropertyDetail';

const PropertyDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // 실제 구현에서는 id를 사용하여 해당 매물 데이터를 가져옴
  // 현재는 하드코드된 데이터를 사용
  return <PropertyDetail />;
};

export default withLayoutBasic(PropertyDetailPage); 