import React from 'react';
import { NextPage } from 'next';
import Top from '../../libs/components/Top';

const MyPage: NextPage = () => {
  return (
    <div>
      <Top />
      <div style={{ padding: '2rem' }}>
        <h1>Hello My Page</h1>
      </div>
    </div>
  );
};

export default MyPage; 