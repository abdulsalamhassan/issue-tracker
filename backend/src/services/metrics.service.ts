import { Types } from "mongoose";
import { Issue } from "../models/Issue";
import { Project } from "../models/Project";

export type DashboardMetrics = {
    totalIssues: number;
    inProgress: number;
    done: number;
    open: number;
    archived: number;
    projectsInProgress: number;
    projectsDone: number;
};

export async function getDashboardMetricsForUser(userId: string | Types.ObjectId): Promise<DashboardMetrics> {
    const projects = await Project.find({ $or: [{ owner: userId }, { members: userId }] }).select("_id").lean();
    const projectIds = projects.map((p) => p._id);
    if (!projectIds.length) return { totalIssues: 0, inProgress: 0, done: 0, open: 0, archived: 0, projectsInProgress: 0, projectsDone: 0 };

    // Aggregate counts grouped by project and status
    const agg = await Issue.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: { project: "$project", status: "$status" }, count: { $sum: 1 } } },
        { $group: { _id: "$_id.project", statuses: { $push: { status: "$_id.status", count: "$count" } }, total: { $sum: "$count" } } }
    ]);

    const metrics: DashboardMetrics = { totalIssues: 0, inProgress: 0, done: 0, open: 0, archived: 0, projectsInProgress: 0, projectsDone: 0 };

    for (const proj of agg) {
        const statusMap: Record<string, number> = { open: 0, in_progress: 0, closed: 0, archived: 0 };
        for (const s of proj.statuses) {
            statusMap[s.status] = s.count;
        }
        metrics.open += statusMap.open || 0;
        metrics.inProgress += statusMap.in_progress || 0;
        metrics.done += statusMap.closed || 0;
        metrics.archived += statusMap.archived || 0;
        metrics.totalIssues += proj.total || 0;

        const hasInProgressWork = (statusMap.open || 0) + (statusMap.in_progress || 0) > 0;
        const hasCompletedWork = !hasInProgressWork && (statusMap.closed || 0) > 0;
        metrics.projectsInProgress += hasInProgressWork ? 1 : 0;
        metrics.projectsDone += hasCompletedWork ? 1 : 0;
    }

    return metrics;
}
