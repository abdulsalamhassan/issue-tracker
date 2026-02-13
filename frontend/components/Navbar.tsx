"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../lib/auth";
import type { User } from "../types";

type Props = {
    user?: User;
};

export default function Navbar({ user }: Props) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const logoutMutation = useMutation({
        mutationFn: () => logoutUser(queryClient),
        onSuccess: async () => {
            router.push("/login");
        }
    });

    return (
        <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">DevTrack Workspace</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                        {user?.name ?? "User"}
                    </span>
                    <button
                        type="button"
                        className="dt-btn-secondary px-3 py-1.5"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                    >
                        {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </button>
                </div>
            </div>
        </header>
    );
}
