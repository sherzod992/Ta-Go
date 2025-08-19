import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RedirectFAQ() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cs/faq');
  }, [router]);

  return null;
}




