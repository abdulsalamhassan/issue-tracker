"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getIssue, updateIssueStatus } from "../../../../../lib/api";
import type { IssueStatus } from "../../../../../types";
import StatusBadge from "../../../../../components/StatusBadge";
import LoadingState from "../../../../../components/LoadingState";
import ErrorState from "../../../../../components/ErrorState";

const NEXT_STATUS_MAP: Record<IssueStatus, IssueStatus | null> = {
    open: "in_progress",
    in_progress: "closed",
    closed: null,
    archived: null
};

export default function IssueDetailPage() {
    const params = useParams<{ projectId: string; issueId: string }>();
    const queryClient = useQueryClient();
    const projectId = String(params.projectId);
    const issueId = String(params.issueId);

    const issueQuery = useQuery({
        queryKey: ["issue", issueId],
        queryFn: () => getIssue(issueId)
    });

    const updateStatusMutation = useMutation({
        mutationFn: (nextStatus: IssueStatus) => updateIssueStatus(issueId, nextStatus),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
        }
    });

    if (issueQuery.isLoading) return <LoadingState label="Loading issue..." />;
    if (issueQuery.isError) return <ErrorState message={issueQuery.error.message} />;
    if (!issueQuery.data) return <ErrorState message="Issue not found" />;

    const issue = issueQuery.data.issue;
    const nextStatus = NEXT_STATUS_MAP[issue.status];

    return (
        <div className="dt-page">
            <div className="dt-card p-6">
                <div className="mb-4">
                    <Link
                        href={`/projects/${projectId}/issues`}
                        className="text-sm text-blue-700 hover:text-blue-800"
                    >
                        Back to Issues
                    </Link>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Issue Detail / {issueId}</p>
                        <h1 className="mt-1 text-[28px] font-semibold leading-8 text-slate-900">{issue.title}</h1>
                    </div>
                    <StatusBadge status={issue.status} />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Priority</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">{issue.priority}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Assignees</p>
                        <p className="mt-1 text-sm text-slate-800">{issue.assignees.length ? issue.assignees.join(", ") : "Unassigned"}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{issue.description || "No description provided."}</p>
                </div>

                <div className="mt-6">
                    <button
                        type="button"
                        disabled={!nextStatus || updateStatusMutation.isPending}
                        onClick={() => {
                            if (!nextStatus) return;
                            updateStatusMutation.mutate(nextStatus);
                        }}
                        className="dt-btn-primary"
                    >
                        {nextStatus ? `Move to ${nextStatus}` : "No further transition"}
                    </button>
                </div>
            </div>
        </div>
    );
}
