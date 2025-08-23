import React from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import SignupComponent from '../../libs/components/auth/SignupComponent';

const SignupPage: NextPage = () => {
  return <SignupComponent />;
};

export default withLayoutBasic(SignupPage);
