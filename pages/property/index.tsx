import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PropertyCreateForm from '../../libs/components/property/PropertyCreateForm';

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

  // Buy 버튼을 눌렀을 때는 기존 property 목록 페이지 표시
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Property List Page</h1>
      <p>Buy properties here</p>
    </div>
  );
};

export default withLayoutBasic(PropertyPage); 