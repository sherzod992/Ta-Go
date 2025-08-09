import React from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PropertyCompare from '../../libs/components/property/PropertyCompare';

const PropertyComparePage: NextPage = () => {
  return <PropertyCompare />;
};

export default withLayoutBasic(PropertyComparePage); 