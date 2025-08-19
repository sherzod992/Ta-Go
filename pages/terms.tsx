import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RedirectTerms() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cs/terms');
  }, [router]);

  return null;
}




