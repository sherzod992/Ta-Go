import React from 'react';
import { NextPage } from 'next';
import Top from '../../libs/components/Top';

const PropertyPage: NextPage = () => {
  return (
    <div>
      <Top />
      <div style={{ padding: '2rem' }}>
        <h1>Hello Property Page</h1>
      </div>
    </div>
  );
};

export default PropertyPage; 