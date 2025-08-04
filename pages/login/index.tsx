import React from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

const LoginPage: NextPage = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Hello Login Page</h1>
    </div>
  );
};

export default withLayoutBasic(LoginPage); 