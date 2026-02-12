import type { Issue, IssuePriority, IssueStatus } from "../types";
import StatusBadge from "./StatusBadge";

type Props = {
    issue: Issue;
    onAdvanceStatus: (issueId: string, next: IssueStatus) => void;
    isUpdating: boolean;
};

const priorityClasses: Record<IssuePriority, string> = {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-slate-100 text-slate-700",
    high: "bg-amber-100 text-amber-800",
    critical: "bg-amber-100 text-amber-800"
};

const nextStatusMap: Record<IssueStatus, IssueStatus | null> = {
    open: "in_progress",
    in_progress: "closed",
    closed: null,
    archived: null
};

function label(status: IssueStatus) {
    if (status === "open") return "Start";
    if (status === "in_progress") return "Mark Done";
    return "No Action";
}

export default function IssueCard({ issue, onAdvanceStatus, isUpdating }: Props) {
    const issueId = issue.id ?? issue._id ?? "";
    const nextStatus = nextStatusMap[issue.status];
    const assignee = issue.assignees?.[0] ? issue.assignees[0] : "Unassigned";

    return (
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <h3 className="text-base font-semibold text-slate-900">{issue.title}</h3>
                    <p className="text-sm text-slate-500">{issue.description || "No description provided."}</p>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge status={issue.status} />
                    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${priorityClasses[issue.priority]}`}>
                        {issue.priority}
                    </span>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-600">Assignee: {assignee}</p>
                <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    disabled={!nextStatus || isUpdating || !issueId}
                    onClick={() => {
                        if (!nextStatus || !issueId) return;
                        onAdvanceStatus(issueId, nextStatus);
                    }}
                >
                    {label(issue.status)}
                </button>
            </div>
        </div>
    );
}
