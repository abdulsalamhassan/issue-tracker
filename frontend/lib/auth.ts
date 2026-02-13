"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, logout } from "./api";
import type { User } from "../types";

const PUBLIC_ROUTES = new Set<string>(["/login", "/register"]);

export function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.has(pathname);
}

export function useMeQuery(enabled = true) {
    return useQuery({
        queryKey: ["me"],
        queryFn: getMe,
        enabled,
        // If we have a cached session in localStorage, return it immediately
        initialData: typeof window !== "undefined" ? (() => {
            try {
                const raw = localStorage.getItem("me");
                return raw ? JSON.parse(raw) as { user: unknown } : undefined;
            } catch {
                return undefined;
            }
        })() : undefined,
        staleTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
        // Revalidate in background on mount if cached
        refetchOnMount: true
    });
}

export function useAuthGuard() {
    const pathname = usePathname();
    const router = useRouter();
    const publicRoute = isPublicRoute(pathname);
    const meQuery = useMeQuery(true);

    useEffect(() => {
        if (publicRoute) return;
        if (meQuery.isError) router.replace("/login");
    }, [publicRoute, meQuery.isError, router]);

    useEffect(() => {
        if (!publicRoute) return;
        if (meQuery.data?.user) router.replace("/dashboard");
    }, [publicRoute, meQuery.data?.user, router]);

    return {
        pathname,
        isPublic: publicRoute,
        isLoading: !publicRoute && meQuery.isLoading,
        user: meQuery.data?.user as User | undefined,
        isAuthenticated: Boolean(meQuery.data?.user)
    };
}

export async function logoutUser(queryClient: ReturnType<typeof useQueryClient>) {
    await logout();
    try {
        localStorage.removeItem("me");
    } catch { }
    queryClient.clear();
}
