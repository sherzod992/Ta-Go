import React from 'react';
import { NextPage } from 'next';
import Top from '../../libs/components/Top';

const CSPage: NextPage = () => {
  return (
    <div>
      <Top />
      <div style={{ padding: '2rem' }}>
        <h1>Hello CS Page</h1>
      </div>
    </div>
  );
};

export default CSPage; 