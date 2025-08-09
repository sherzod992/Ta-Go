import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/cs/faq',
      permanent: true,
    },
  };
};

export default function RedirectFAQ() { return null; }




