import React from 'react';
import { NextPage } from 'next';
import HomePageComponent from '../libs/components/homepage/HomePage';
import withLayoutHome from '../libs/components/layout/LayoutHome';

const HomePage: NextPage = () => {
  return <HomePageComponent />;
};

export default withLayoutHome(HomePage);
