/**
 * React Query Provider - TanStack Query Konfigürasyonu
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// QueryClient konfigürasyonu
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 dakika
      gcTime: 10 * 60 * 1000, // 10 dakika (eski cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: 'always'
    },
    mutations: {
      retry: 1,
      retryDelay: 1000
    }
  }
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Development modunda devtools'u göster - şimdilik devre dışı */}
    </QueryClientProvider>
  );
};

export { queryClient };
export default QueryProvider; 