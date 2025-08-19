import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RedirectHelp() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cs');
  }, [router]);

  return null;
}




