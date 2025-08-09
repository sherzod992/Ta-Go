import React from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CSHome from '../../libs/components/cs/CSHome';

const CSPage: NextPage = () => {
  return <CSHome />;
};

export default withLayoutBasic(CSPage);