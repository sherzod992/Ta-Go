import React from 'react';
import { NextPage } from 'next';
import Top from '../../libs/components/Top';

const LoginPage: NextPage = () => {
  return (
    <div>
      <Top />
      <div style={{ padding: '2rem' }}>
        <h1>Hello Login Page</h1>
      </div>
    </div>
  );
};

export default LoginPage; 