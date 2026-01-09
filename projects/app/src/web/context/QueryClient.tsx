import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: false,
      // 缓存5分钟，避免重复请求
      cacheTime: 5 * 60 * 1000,
      // 数据在1分钟内认为是新鲜的
      staleTime: 60 * 1000,
      networkMode: 'always'
    }
  }
});

const QueryClientContext = ({ children }: { children: ReactNode }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default QueryClientContext;
