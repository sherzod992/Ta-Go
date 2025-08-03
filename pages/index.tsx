import React from 'react';
import { NextPage } from 'next';
import Top from '../libs/components/Top';

const HomePage: NextPage = () => {
  return (
    <div>
      <Top />
      <div style={{ padding: '2rem' }}>
        <h1>Welcome to ta-Go</h1>
        <p>This is the home page of your application.</p>
      </div>
    </div>
  );
};

export default HomePage;
