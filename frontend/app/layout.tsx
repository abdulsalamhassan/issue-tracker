"use client";
import React from "react";
import "./globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import Navbar from "../components/Navbar";
import LoadingState from "../components/LoadingState";
import { useAuthGuard } from "../lib/auth";
import Sidebar from "../components/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-slate-50 text-slate-900">
                <QueryClientProvider client={queryClient}>
                    <AppShell>{children}</AppShell>
                </QueryClientProvider>
            </body>
        </html>
    );
}

function AppShell({ children }: { children: React.ReactNode }) {
    const { isPublic, isLoading, user, isAuthenticated } = useAuthGuard();
    const showProtectedLoader = !isPublic && (isLoading || !isAuthenticated);

    if (isPublic) {
        return <main className="min-h-screen bg-slate-100">{children}</main>;
    }

    if (showProtectedLoader) {
        return <LoadingState label="Checking session..." fullScreen />;
    }

    return (
        <div className="flex min-h-screen bg-slate-100">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <Navbar user={user} />
                <main className="px-6 py-6 lg:px-8">
                    <div className="mx-auto w-full max-w-[1200px]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
