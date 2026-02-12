"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register } from "../../lib/api";
import ErrorState from "../../components/ErrorState";

export default function RegisterPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const registerMutation = useMutation({
        mutationFn: register,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["me"] });
            router.push("/dashboard");
        },
        onError: (err: Error) => setError(err.message)
    });

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        registerMutation.mutate({ name, email, password });
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
                    <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
                    <p className="mt-1 text-sm text-slate-600">Get access to your engineering workspace.</p>

                    <form onSubmit={onSubmit} className="mt-6 space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="name" className="text-sm font-medium text-slate-700">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="dt-input"
                                required
                            />
                        </div>

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
                                minLength={6}
                                required
                            />
                        </div>

                        {error && <ErrorState message={error} />}

                        <button
                            type="submit"
                            className="dt-btn-primary w-full"
                            disabled={registerMutation.isPending}
                        >
                            {registerMutation.isPending ? "Creating..." : "Create Account"}
                        </button>
                    </form>

                    <p className="mt-4 text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-blue-700 hover:text-blue-800">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
