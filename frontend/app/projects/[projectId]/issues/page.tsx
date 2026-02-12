"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignIssue, createIssue, getIssues, getProject, updateIssueStatus } from "../../../../lib/api";
import type { Issue, IssuePriority, IssueStatus, PaginatedResponse } from "../../../../types";
import IssueCard from "../../../../components/IssueCard";
import StatusBadge from "../../../../components/StatusBadge";
import LoadingState from "../../../../components/LoadingState";
import ErrorState from "../../../../components/ErrorState";

type SelectOption<T extends string> = {
    value: "" | T;
    label: string;
};

const STATUS_OPTIONS: SelectOption<IssueStatus>[] = [
    { value: "", label: "All" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "closed", label: "Done" },
    { value: "archived", label: "Archived" }
];

const PRIORITY_OPTIONS: SelectOption<IssuePriority>[] = [
    { value: "", label: "All" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
];

const PAGE_SIZE = 10;

const PRIORITY_STYLES: Record<IssuePriority, string> = {
    low: "text-slate-600",
    medium: "text-slate-700",
    high: "text-amber-700",
    critical: "text-red-600"
};

const NEXT_STATUS_MAP: Record<IssueStatus, IssueStatus | null> = {
    open: "in_progress",
    in_progress: "closed",
    closed: null,
    archived: null
};

function shortId(value: string): string {
    if (!value) return value;
    if (value.length <= 10) return value;
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export default function IssuesPage() {
    const params = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();
    const projectId = String(params.projectId);

    const [statusFilter, setStatusFilter] = useState<"" | IssueStatus>("");
    const [priorityFilter, setPriorityFilter] = useState<"" | IssuePriority>("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<IssuePriority>("medium");
    const [assigneeDrafts, setAssigneeDrafts] = useState<Record<string, string>>({});
    const [createError, setCreateError] = useState<string | null>(null);
    const [assignError, setAssignError] = useState<string | null>(null);

    const projectQuery = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => getProject(projectId)
    });

    const filters = useMemo(
        () => ({ status: statusFilter, priority: priorityFilter, page, limit: PAGE_SIZE }),
        [statusFilter, priorityFilter, page]
    );

    const issuesQuery = useQuery({
        queryKey: ["issues", projectId, filters],
        queryFn: () => getIssues(projectId, filters)
    });

    const createIssueMutation = useMutation({
        mutationFn: createIssue,
        onSuccess: async () => {
            setShowCreateForm(false);
            setTitle("");
            setDescription("");
            setPriority("medium");
            setCreateError(null);
            setPage(1);
            await queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
        },
        onError: (error: Error) => setCreateError(error.message)
    });

    const assignIssueMutation = useMutation({
        mutationFn: ({ issueId, assigneeId }: { issueId: string; assigneeId: string }) => assignIssue(issueId, assigneeId),
        onSuccess: async () => {
            setAssignError(null);
            await queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
        },
        onError: (error: Error) => setAssignError(error.message)
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ issueId, nextStatus }: { issueId: string; nextStatus: IssueStatus }) =>
            updateIssueStatus(issueId, nextStatus),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
        }
    });

    const onCreateIssue = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setCreateError(null);
        createIssueMutation.mutate({
            projectId,
            title,
            description: description || undefined,
            priority
        });
    };

    const filteredItems = useMemo(() => {
        const items = issuesQuery.data?.items || [];
        const term = search.trim().toLowerCase();
        if (!term) return items;
        return items.filter((issue) => issue.title.toLowerCase().includes(term));
    }, [issuesQuery.data?.items, search]);

    const totalPages = issuesQuery.data ? Math.max(1, Math.ceil(issuesQuery.data.total / issuesQuery.data.limit)) : 1;
    const canPrev = page > 1;
    const canNext = page < totalPages;

    return (
        <div className="dt-page">
            <div className="space-y-1">
                <p className="text-sm text-slate-500">Projects / {projectQuery.data?.project?.name ?? "..."}</p>
                <div className="flex items-center justify-between gap-4">
                    <h1 className="dt-title">Issues</h1>
                    <button
                        type="button"
                        onClick={() => setShowCreateForm((previous) => !previous)}
                        className="dt-btn-primary"
                    >
                        {showCreateForm ? "Cancel" : "Create Issue"}
                    </button>
                </div>
                <p className="text-sm text-slate-600">Manage and track engineering tasks for this project.</p>
            </div>

            {showCreateForm && (
                <form onSubmit={onCreateIssue} className="dt-card space-y-4 p-5">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Title</label>
                        <input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className="dt-input"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            className="dt-input"
                            rows={3}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Priority</label>
                        <select
                            value={priority}
                            onChange={(event) => setPriority(event.target.value as IssuePriority)}
                            className="dt-select w-full"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                    {createError && <ErrorState message={createError} />}
                    <button
                        type="submit"
                        className="dt-btn-primary"
                        disabled={createIssueMutation.isPending}
                    >
                        {createIssueMutation.isPending ? "Creating..." : "Create"}
                    </button>
                </form>
            )}

            <div className="dt-panel grid gap-3 lg:grid-cols-4">
                <select
                    value={statusFilter}
                    onChange={(event) => {
                        setStatusFilter(event.target.value as "" | IssueStatus);
                        setPage(1);
                    }}
                    className="dt-select"
                >
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            Status: {option.label}
                        </option>
                    ))}
                </select>
                <select
                    value={priorityFilter}
                    onChange={(event) => {
                        setPriorityFilter(event.target.value as "" | IssuePriority);
                        setPage(1);
                    }}
                    className="dt-select"
                >
                    {PRIORITY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            Priority: {option.label}
                        </option>
                    ))}
                </select>
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Filter issues..."
                    className="dt-input lg:col-span-2"
                />
            </div>

            {projectQuery.isLoading && <LoadingState label="Loading project..." />}
            {projectQuery.isError && <ErrorState message={projectQuery.error.message} />}
            {issuesQuery.isLoading && <LoadingState label="Loading issues..." />}
            {issuesQuery.isError && <ErrorState message={issuesQuery.error.message} />}
            {assignError && <ErrorState message={assignError} />}

            {issuesQuery.isSuccess && (
                <>
                    <div className="dt-card hidden overflow-hidden lg:block">
                        <table className="dt-table">
                                    <thead className="dt-thead">
                                        <tr>
                                            <th className="px-4 py-3">Key</th>
                                            <th className="px-4 py-3">Title</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Priority</th>
                                            <th className="px-4 py-3">Assignee</th>
                                            <th className="px-4 py-3">Assign</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                            <tbody>
                                {assignError && (
                                    <tr className="border-b border-slate-100">
                                        <td colSpan={7} className="px-4 py-3">
                                            <p className="text-xs text-red-600">{assignError}</p>
                                        </td>
                                    </tr>
                                )}
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                                            No issues found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((issue) => {
                                        const issueId = issue.id ?? issue._id ?? "";
                                        const nextStatus = NEXT_STATUS_MAP[issue.status];
                                        return (
                                            <tr key={issueId} className="dt-row">
                                                <td className="px-4 py-4 text-slate-500">ISS-{issueId.slice(-4).toUpperCase()}</td>
                                                <td className="px-4 py-4">
                                                    <Link
                                                        href={`/projects/${projectId}/issues/${issueId}`}
                                                        className="font-medium text-slate-900 hover:text-blue-700"
                                                    >
                                                        {issue.title}
                                                    </Link>
                                                    <p className="text-xs text-slate-500">{issue.description || "No description provided."}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge status={issue.status} />
                                                </td>
                                                <td className={`px-4 py-4 text-xs font-semibold uppercase ${PRIORITY_STYLES[issue.priority]}`}>
                                                    {issue.priority}
                                                </td>
                                                <td className="px-4 py-4 text-slate-600">{issue.assignees[0] || "Unassigned"}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={assigneeDrafts[issueId] ?? ""}
                                                            onChange={(event) =>
                                                                setAssigneeDrafts((prev) => ({ ...prev, [issueId]: event.target.value }))
                                                            }
                                                            className="dt-select px-2 py-1.5 text-xs"
                                                        >
                                                            <option value="">Select member</option>
                                                            {(projectQuery.data?.project.members || []).map((member) => (
                                                                <option key={member} value={member}>
                                                                    {shortId(member)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            type="button"
                                                            disabled={!assigneeDrafts[issueId] || assignIssueMutation.isPending}
                                                            onClick={() => {
                                                                const assigneeId = assigneeDrafts[issueId];
                                                                if (!assigneeId || !issueId) return;
                                                                assignIssueMutation.mutate({ issueId, assigneeId });
                                                            }}
                                                            className="dt-btn-ghost px-2 py-1.5"
                                                        >
                                                            Assign
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!nextStatus || !issueId) return;
                                                            updateStatusMutation.mutate({ issueId, nextStatus });
                                                        }}
                                                        disabled={!nextStatus || updateStatusMutation.isPending}
                                                        className="dt-btn-ghost"
                                                    >
                                                        {nextStatus ? "Advance" : "Completed"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid gap-4 lg:hidden">
                        {assignError && <ErrorState message={assignError} />}
                        {filteredItems.length === 0 ? (
                            <LoadingState label="No issues found." />
                        ) : (
                            filteredItems.map((issue) => (
                                <IssueCard
                                    key={issue.id ?? issue._id}
                                    issue={issue}
                                    isUpdating={updateStatusMutation.isPending}
                                    onAdvanceStatus={(issueId, nextStatus) => {
                                        updateStatusMutation.mutate({ issueId, nextStatus });
                                    }}
                                />
                            ))
                        )}
                    </div>
                </>
            )}

            {issuesQuery.isSuccess && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    canPrev={canPrev}
                    canNext={canNext}
                    onPrev={() => setPage((current) => Math.max(1, current - 1))}
                    onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
                />
            )}
        </div>
    );
}

type PaginationProps = {
    page: number;
    totalPages: number;
    canPrev: boolean;
    canNext: boolean;
    onPrev: () => void;
    onNext: () => void;
};

function Pagination({ page, totalPages, canPrev, canNext, onPrev, onNext }: PaginationProps) {
    return (
        <div className="dt-panel flex items-center justify-between">
            <p className="text-sm text-slate-600">
                Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={!canPrev}
                    className="dt-btn-secondary px-3 py-2"
                >
                    Previous
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    disabled={!canNext}
                    className="dt-btn-primary px-3 py-2"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
