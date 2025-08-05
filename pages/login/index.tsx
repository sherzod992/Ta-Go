import React, { useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import LoginComponent from '../../libs/components/auth/LoginComponent';

const LoginPage: NextPage = () => {
  return <LoginComponent />;
};

export default withLayoutBasic(LoginPage); 