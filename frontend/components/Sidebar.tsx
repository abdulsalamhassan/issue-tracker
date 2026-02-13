"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
    label: string;
    href: string;
};

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Projects", href: "/projects" }
];

function isActive(pathname: string, href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
}

export default function Sidebar() {
    const pathname = usePathname();
    const pathParts = pathname.split("/").filter(Boolean);
    const inProjectScope = pathParts[0] === "projects" && Boolean(pathParts[1]);
    const currentProjectId = inProjectScope ? pathParts[1] : null;
    const issuesHref = currentProjectId ? `/projects/${currentProjectId}/issues` : "/projects";

    return (
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
            <div className="h-14 border-b border-slate-200 px-5">
                <div className="flex h-full items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-[10px] font-bold text-white shadow-sm">
                        IT
                    </span>
                    <span className="text-sm font-semibold text-slate-900">DevTrack</span>
                </div>
            </div>

            <nav className="px-3 py-5">
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Navigation</p>
                <ul className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(pathname, item.href);
                        return (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className={`block rounded-md px-3 py-2.5 text-sm ${
                                        active
                                            ? "border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-800 shadow-sm"
                                            : "border-l-2 border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {inProjectScope && (
                <div className="border-t border-slate-200 px-3 py-5">
                    <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Current Project</p>
                    <ul className="space-y-1">
                        <li>
                            <Link
                                href={issuesHref}
                                className={`block rounded-md px-3 py-2.5 text-sm ${
                                    pathname.includes("/issues/")
                                        ? "border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-800 shadow-sm"
                                        : "border-l-2 border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                            >
                                Issue Board
                            </Link>
                        </li>
                        <li>
                            <p className="rounded-md px-3 py-2 font-mono text-xs text-slate-500">ID: {currentProjectId}</p>
                        </li>
                    </ul>
                </div>
            )}
        </aside>
    );
}
