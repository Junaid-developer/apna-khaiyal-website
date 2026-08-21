import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes fresh cache
      gcTime: 1000 * 60 * 15, // 15 minutes garbage collection memory retention
      refetchOnWindowFocus: false, // Avoid jarring focus refetches
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // Do not retry 403 Forbidden or 401 Unauthorized errors
        if (error?.status === 403 || error?.code === '403' || error?.code === '42501') {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
