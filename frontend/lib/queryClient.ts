import { QueryClient } from "@tanstack/react-query";
import type { ApiRequestError } from "./api";

function shouldRetry(failureCount: number, error: unknown) {
    // Don't retry on client errors (4xx). Retry a couple of times for network/server issues.
    const err = error as Partial<ApiRequestError> | undefined;
    if (err && typeof err.status === "number") {
        if (err.status >= 400 && err.status < 500) return false;
    }
    return failureCount < 2;
}

function exponentialBackoff(attempt: number) {
    const base = 300; // ms
    const jitter = Math.random() * 100;
    return Math.min(2000, Math.pow(2, attempt) * base + jitter);
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: shouldRetry,
            retryDelay: exponentialBackoff,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: 2 * 60 * 1000, // 2 minutes
            cacheTime: 5 * 60 * 1000 // 5 minutes
        }
    }
});
