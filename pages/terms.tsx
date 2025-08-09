import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/cs/terms',
      permanent: true,
    },
  };
};

export default function RedirectTerms() { return null; }




