import type { IssueStatus } from "../types";

type Props = {
    status: IssueStatus;
};

const statusClasses: Record<IssueStatus, string> = {
    open: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-100 text-blue-700",
    closed: "bg-green-100 text-green-800",
    archived: "bg-slate-200 text-slate-700"
};

const statusLabel: Record<IssueStatus, string> = {
    open: "Open",
    in_progress: "In Progress",
    closed: "Done",
    archived: "Archived"
};

export default function StatusBadge({ status }: Props) {
    return (
        <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusClasses[status]}`}>
            {statusLabel[status]}
        </span>
    );
}
