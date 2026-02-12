"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../../lib/api";
import ErrorState from "../../components/ErrorState";

export default function LoginPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["me"] });
            router.push("/dashboard");
        },
        onError: (err: Error) => {
            setError(err.message);
        }
    });

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        loginMutation.mutate({ email, password });
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="h-14 border-b border-slate-200 bg-white">
                <div className="flex h-full items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-blue-600 text-[10px] font-semibold text-white">
                            IT
                        </span>
                        <span className="text-sm font-semibold text-slate-900">DevTrack</span>
                    </div>
                    <span className="text-xs text-slate-500">v1.0.0</span>
                </div>
            </header>

            <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6">
                <div className="dt-card w-full max-w-md p-7">
                    <h1 className="text-2xl font-semibold text-slate-900">Sign in to DevTrack</h1>
                    <p className="mt-1 text-sm text-slate-600">Enter your credentials to manage your issues.</p>

                    <form onSubmit={onSubmit} className="mt-6 space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                Work Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="dt-input"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="password" className="text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="dt-input"
                                required
                            />
                        </div>

                        {error && <ErrorState message={error} />}

                        <button
                            type="submit"
                            className="dt-btn-primary w-full"
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                    <p className="mt-4 text-sm text-slate-600">
                        No account?{" "}
                        <Link href="/register" className="font-medium text-blue-700 hover:text-blue-800">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
