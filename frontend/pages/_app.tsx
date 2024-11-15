import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUserStore } from '@/store/user-store';
import Header from '@/components/header';
import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const loginDetails = useUserStore((state) => state.loginDetails);

  // Define the list of paths that do not require authentication
  const unprotectedPaths = ['/login', '/register'];

  useEffect(() => {
    // Check if the current path is unprotected
    const isUnprotectedPath = unprotectedPaths.includes(router.pathname);

    // If the user is not logged in and the path is not unprotected, redirect to login
    if (!loginDetails && !isUnprotectedPath) {
      router.push('/login');
    }
  }, [loginDetails, router.pathname]);

  // Render the component only if the user is logged in or the path is unprotected
  if (!loginDetails && !unprotectedPaths.includes(router.pathname)) {
    return null; // Or a loading spinner
  }

  return (
    <>
      <Head>
        <title>HamroBank | Signature Forgery Detection</title>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <link rel="icon" type="image/png" href="favicon.png" />
      </Head>
      <Header />
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </>
  );
}
