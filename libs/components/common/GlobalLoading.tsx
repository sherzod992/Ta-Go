import React from 'react';
import { useLoading } from '../../contexts/LoadingContext';
import LoadingSpinner from './LoadingSpinner';
import ProgressBar from './ProgressBar';

const GlobalLoading: React.FC = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) {
    return null;
  }

  return (
    <>
      {/* 상단 Progress Bar */}
      <ProgressBar
        isLoading={isLoading}
        message={loadingMessage}
        variant="indeterminate"
        color="primary"
      />
      
      {/* 전체 화면 로딩 스피너 */}
      <LoadingSpinner
        message={loadingMessage}
        fullScreen={true}
        variant="circular"
        size={60}
      />
    </>
  );
};

export default GlobalLoading;
