import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface UsePageTransitionOptions {
  delay?: number;
  showProgressBar?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
}

export const usePageTransition = (options: UsePageTransitionOptions = {}) => {
  const {
    delay = 300,
    showProgressBar = true,
    onStart,
    onComplete,
  } = options;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('페이지를 불러오는 중...');

  useEffect(() => {
    const handleStart = (url: string) => {
      // 같은 페이지 내의 해시 변경은 무시
      if (url.split('#')[0] === router.asPath.split('#')[0]) {
        return;
      }

      setIsLoading(true);
      setLoadingMessage('페이지를 불러오는 중...');
      onStart?.();
    };

    const handleComplete = () => {
      // 약간의 지연을 두어 사용자가 로딩 상태를 인지할 수 있도록 함
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage('페이지를 불러오는 중...');
        onComplete?.();
      }, delay);
    };

    const handleError = () => {
      setIsLoading(false);
      setLoadingMessage('페이지를 불러오는 중...');
      onComplete?.();
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router, delay, onStart, onComplete]);

  const startLoading = (message?: string) => {
    setIsLoading(true);
    if (message) {
      setLoadingMessage(message);
    }
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage('페이지를 불러오는 중...');
  };

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    setLoadingMessage,
  };
};

// 특정 작업의 로딩 상태를 관리하는 훅
export const useTaskLoading = (initialMessage = '처리 중...') => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(initialMessage);

  const startTask = (message?: string) => {
    setIsLoading(true);
    if (message) {
      setLoadingMessage(message);
    }
  };

  const stopTask = () => {
    setIsLoading(false);
    setLoadingMessage(initialMessage);
  };

  const updateMessage = (message: string) => {
    setLoadingMessage(message);
  };

  return {
    isLoading,
    loadingMessage,
    startTask,
    stopTask,
    updateMessage,
  };
};

// 데이터 로딩 상태를 관리하는 훅
export const useDataLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('데이터를 불러오는 중...');

  const startLoading = (message?: string) => {
    setIsLoading(true);
    setProgress(0);
    if (message) {
      setLoadingMessage(message);
    }
  };

  const stopLoading = () => {
    setIsLoading(false);
    setProgress(100);
    setTimeout(() => {
      setProgress(0);
    }, 500);
  };

  const updateProgress = (newProgress: number) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
  };

  const updateMessage = (message: string) => {
    setLoadingMessage(message);
  };

  return {
    isLoading,
    progress,
    loadingMessage,
    startLoading,
    stopLoading,
    updateProgress,
    updateMessage,
  };
};
