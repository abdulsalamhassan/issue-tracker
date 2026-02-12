import { Issue, IssuePriority, IssueStatus } from "../models/Issue";
import { Project } from "../models/Project";
import { Types } from "mongoose";

export interface CreatedIssue {
    id: string;
    title: string;
    status: IssueStatus;
    project: string;
}

const allowedTransitions: Record<IssueStatus, IssueStatus[]> = {
    open: ["in_progress"],
    in_progress: ["closed"],
    closed: [],
    archived: []
};

export async function createIssue(projectId: string | Types.ObjectId, reporterId: string | Types.ObjectId, data: { title: string; description?: string; assignees?: string[]; priority?: IssuePriority }) {
    const project = await Project.findById(projectId).select("members owner");
    if (!project) throw new Error("PROJECT_NOT_FOUND");

    // ensure assignees are project members
    const assignees = (data.assignees || []).filter((a) => project.members.map(String).includes(String(a)));

    const issue = await Issue.create({
        title: data.title,
        description: data.description,
        project: project._id,
        reporter: reporterId,
        assignees,
        priority: data.priority || "medium"
    });

    return { id: String(issue._id), title: issue.title, status: issue.status, project: String(issue.project) } as CreatedIssue;
}

export async function getIssuesForProject(projectId: string | Types.ObjectId, filters: { status?: string; priority?: string; assignedTo?: string }, page = 1, limit = 20) {
    const query: any = { project: projectId };
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.assignedTo) query.assignees = filters.assignedTo;

    const skip = Math.max(0, page - 1) * limit;
    const [items, total] = await Promise.all([
        Issue.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select("title status priority assignees reporter").lean(),
        Issue.countDocuments(query)
    ]);
    return { items, total, page, limit };
}

export async function getIssueById(issueId: string | Types.ObjectId, actorId: string | Types.ObjectId) {
    const issue = await Issue.findById(issueId).lean();
    if (!issue) throw new Error("NOT_FOUND");

    const project = await Project.findById(issue.project).select("owner members").lean();
    if (!project) throw new Error("PROJECT_NOT_FOUND");

    const actor = String(actorId);
    const isOwner = String(project.owner) === actor;
    const isMember = Array.isArray(project.members) && project.members.map(String).includes(actor);
    if (!isOwner && !isMember) throw new Error("FORBIDDEN");

    return issue;
}

export async function updateIssueStatus(issueId: string | Types.ObjectId, newStatus: IssueStatus, actorId?: string) {
    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error("NOT_FOUND");
    const current = issue.status as IssueStatus;
    if (!allowedTransitions[current].includes(newStatus)) throw new Error("INVALID_TRANSITION");
    // Authorization: only project owner or an assignee may change status
    if (actorId) {
        const project = await Project.findById(issue.project).select("owner members");
        const actorStr = String(actorId);
        const isOwner = project && String(project.owner) === actorStr;
        const isAssignee = issue.assignees.map(String).includes(actorStr);
        if (!isOwner && !isAssignee) throw new Error("FORBIDDEN");
    }
    issue.status = newStatus;
    await issue.save();
    return { id: String(issue._id), status: issue.status };
}

export async function assignIssue(issueId: string | Types.ObjectId, assigneeId: string | Types.ObjectId, actorId: string | Types.ObjectId) {
    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error("NOT_FOUND");
    const project = await Project.findById(issue.project).select("owner members");
    if (!project) throw new Error("PROJECT_NOT_FOUND");

    const actorStr = String(actorId);
    const isOwner = String(project.owner) === actorStr;
    const isReporter = String(issue.reporter) === actorStr;
    if (!isOwner && !isReporter) throw new Error("FORBIDDEN");

    const assigneeStr = String(assigneeId);
    if (!project.members.map(String).includes(assigneeStr)) throw new Error("ASSIGNEE_NOT_MEMBER");
    if (issue.assignees.map(String).includes(assigneeStr)) return { id: String(issue._id), assignees: issue.assignees.map(String) };
    issue.assignees.push(assigneeId as any);
    await issue.save();
    return { id: String(issue._id), assignees: issue.assignees.map(String) };
}
