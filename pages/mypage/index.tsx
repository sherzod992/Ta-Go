import React from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

const MyPage: NextPage = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Hello My Page</h1>
    </div>
  );
};

export default withLayoutBasic(MyPage); 