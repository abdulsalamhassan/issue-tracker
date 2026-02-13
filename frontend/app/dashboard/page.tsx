"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProjects, getDashboardMetrics } from "../../lib/api";
import type { Project, ProjectsResponse } from "../../types";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";


type DashboardMetrics = {
    totalIssues: number;
    inProgress: number;
    done: number;
    open: number;
    archived: number;
    projectsInProgress: number;
    projectsDone: number;
};



export default function DashboardPage() {
    const projectsQuery = useQuery<ProjectsResponse>({
        queryKey: ["projects"],
        queryFn: getProjects
    });

    const recentProjects = useMemo(() => {
        if (!projectsQuery.data?.projects) return [];
        return projectsQuery.data.projects.slice(0, 5);
    }, [projectsQuery.data?.projects]);

    const metricsQuery = useQuery<DashboardMetrics>({
        queryKey: ["dashboard-metrics"],
        enabled: Boolean(projectsQuery.data?.projects?.length),
        staleTime: 2 * 60 * 1000,
        queryFn: getDashboardMetrics
    });

    const completionRate = useMemo(() => {
        if (!metricsQuery.data) return 0;
        const tracked = metricsQuery.data.open + metricsQuery.data.inProgress + metricsQuery.data.done;
        if (tracked === 0) return 0;
        return Math.round((metricsQuery.data.done / tracked) * 100);
    }, [metricsQuery.data]);

    return (
        <div className="dt-page">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="dt-title">Dashboard</h1>
                    <p className="dt-subtitle">Overview of project activity and quick navigation.</p>
                </div>
                <Link
                    href="/projects"
                    className="dt-btn-primary"
                >
                    Manage Projects
                </Link>
            </div>

            {projectsQuery.isLoading && <LoadingState label="Loading dashboard..." />}
            {projectsQuery.isError && <ErrorState message={projectsQuery.error.message} />}

            {projectsQuery.isSuccess && (
                <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MetricCard label="Total Projects" value={projectsQuery.data?.projects?.length ?? 0} tone="neutral" />
                        <MetricCard
                            label="Projects In Progress"
                            value={metricsQuery.data?.projectsInProgress ?? 0}
                            tone="amber"
                            loading={metricsQuery.isLoading}
                        />
                        <MetricCard
                            label="Done Projects"
                            value={metricsQuery.data?.projectsDone ?? 0}
                            tone="green"
                            loading={metricsQuery.isLoading}
                        />
                        <MetricCard
                            label="Completion Rate"
                            value={`${completionRate}%`}
                            tone="slate"
                            loading={metricsQuery.isLoading}
                        />
                    </div>

                    <div className="grid gap-4 xl:grid-cols-5">
                        <MetricCard
                            label="Total Issues"
                            value={metricsQuery.data?.totalIssues ?? 0}
                            tone="neutral"
                            loading={metricsQuery.isLoading}
                        />
                        <MetricCard
                            label="Open"
                            value={metricsQuery.data?.open ?? 0}
                            tone="slate"
                            loading={metricsQuery.isLoading}
                        />
                        <MetricCard
                            label="In Progress"
                            value={metricsQuery.data?.inProgress ?? 0}
                            tone="amber"
                            loading={metricsQuery.isLoading}
                        />
                        <MetricCard
                            label="Done"
                            value={metricsQuery.data?.done ?? 0}
                            tone="green"
                            loading={metricsQuery.isLoading}
                        />
                        <MetricCard
                            label="Archived"
                            value={metricsQuery.data?.archived ?? 0}
                            tone="neutral"
                            loading={metricsQuery.isLoading}
                        />
                    </div>
                    {metricsQuery.isError && <ErrorState message={metricsQuery.error.message} />}

                    <div className="dt-card space-y-4 p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-slate-900">Issue Status Overview</h2>
                            <p className="text-xs text-slate-500">Across all projects</p>
                        </div>
                        <StatusRow
                            label="Open"
                            value={metricsQuery.data?.open ?? 0}
                            total={metricsQuery.data?.totalIssues ?? 0}
                            color="bg-slate-400"
                            loading={metricsQuery.isLoading}
                        />
                        <StatusRow
                            label="In Progress"
                            value={metricsQuery.data?.inProgress ?? 0}
                            total={metricsQuery.data?.totalIssues ?? 0}
                            color="bg-amber-400"
                            loading={metricsQuery.isLoading}
                        />
                        <StatusRow
                            label="Done"
                            value={metricsQuery.data?.done ?? 0}
                            total={metricsQuery.data?.totalIssues ?? 0}
                            color="bg-green-500"
                            loading={metricsQuery.isLoading}
                        />
                        <StatusRow
                            label="Archived"
                            value={metricsQuery.data?.archived ?? 0}
                            total={metricsQuery.data?.totalIssues ?? 0}
                            color="bg-slate-300"
                            loading={metricsQuery.isLoading}
                        />
                    </div>

                    <div className="dt-card overflow-hidden">
                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-sm font-medium text-slate-700">Recent Projects</p>
                        </div>
                        <table className="dt-table">
                            <thead className="dt-thead">
                                <tr>
                                    <th className="px-4 py-3">Project</th>
                                    <th className="px-4 py-3">Key</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentProjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                                            No projects yet.
                                        </td>
                                    </tr>
                                ) : (
                                    recentProjects.map((project: Project) => (
                                        <tr key={project.id} className="dt-row">
                                            <td className="px-4 py-4">
                                                <p className="font-medium text-slate-900">{project.name}</p>
                                                <p className="text-xs text-slate-500">{project.description || "No description provided."}</p>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">{project.key}</td>
                                            <td className="px-4 py-4 text-right">
                                                <Link
                                                    href={`/projects/${project.id}/issues`}
                                                    className="dt-btn-ghost inline-flex"
                                                >
                                                    View Issues
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

type MetricTone = "neutral" | "slate" | "amber" | "green";

type MetricCardProps = {
    label: string;
    value: number | string;
    tone: MetricTone;
    loading?: boolean;
};

function MetricCard({ label, value, tone, loading = false }: MetricCardProps) {
    const toneStyles: Record<MetricTone, string> = {
        neutral: "border-slate-200",
        slate: "border-slate-300",
        amber: "border-amber-200 bg-amber-50/40",
        green: "border-green-200 bg-green-50/40"
    };

    const valueStyles: Record<MetricTone, string> = {
        neutral: "text-slate-900",
        slate: "text-slate-800",
        amber: "text-amber-700",
        green: "text-green-700"
    };

    return (
        <div className={`dt-kpi ${toneStyles[tone]}`}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-3 text-3xl font-semibold ${valueStyles[tone]}`}>{loading ? "--" : value}</p>
        </div>
    );
}

type StatusRowProps = {
    label: string;
    value: number;
    total: number;
    color: string;
    loading?: boolean;
};

function StatusRow({ label, value, total, color, loading = false }: StatusRowProps) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="text-slate-500">{loading ? "--" : `${value} (${percentage}%)`}</span>
            </div>
            <div className="h-2 rounded-md bg-slate-100">
                <div
                    className={`h-2 rounded-md ${color}`}
                    style={{ width: `${loading ? 0 : percentage}%` }}
                />
            </div>
        </div>
    );
}
