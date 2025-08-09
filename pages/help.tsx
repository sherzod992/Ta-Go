import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/cs',
      permanent: true,
    },
  };
};

export default function RedirectHelp() { return null; }




