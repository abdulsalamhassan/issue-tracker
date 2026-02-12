import { Request, Response } from "express";
import { body, validationResult, query } from "express-validator";
import { createIssue, getIssuesForProject, updateIssueStatus, assignIssue, getIssueById } from "../services/issue.service";

export const createValidators = [
    body("title").isString().notEmpty(),
    body("assignees").optional().isArray(),
    body("assignees.*").optional().isMongoId(),
    body("priority").optional().isIn(["low", "medium", "high", "critical"]) // validate priority
];

export async function createIssueController(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { projectId } = req.params;
    const { title, description, assignees, priority } = req.body;
    try {
        const issue = await createIssue(projectId, userId, { title, description, assignees, priority });
        return res.status(201).json({ issue });
    } catch (err: any) {
        if (err.message === "PROJECT_NOT_FOUND") return res.status(404).json({ message: "Project not found" });
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const listValidators = [
    query("status").optional().isIn(["open", "in_progress", "closed", "archived"]),
    query("priority").optional().isIn(["low", "medium", "high", "critical"]),
    query("assignedTo").optional().isMongoId(),
    query("page").optional().toInt(),
    query("limit").optional().toInt()
];

export async function listIssuesController(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { projectId } = req.params;
    const { status, priority, assignedTo } = req.query as any;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const filters = { status, priority, assignedTo };
    try {
        const result = await getIssuesForProject(projectId, filters, page, limit);
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getIssueController(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { issueId } = req.params;
    try {
        const issue = await getIssueById(issueId, userId);
        return res.json({ issue });
    } catch (err: any) {
        if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Issue not found" });
        if (err.message === "PROJECT_NOT_FOUND") return res.status(404).json({ message: "Project not found" });
        if (err.message === "FORBIDDEN") return res.status(403).json({ message: "Access denied" });
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const statusValidators = [body("status").isIn(["open", "in_progress", "closed", "archived"])];

export async function updateStatusController(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { issueId } = req.params;
    const { status } = req.body;
    try {
        const result = await updateIssueStatus(issueId, status as any, userId);
        return res.json(result);
    } catch (err: any) {
        if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Issue not found" });
        if (err.message === "INVALID_TRANSITION") return res.status(400).json({ message: "Invalid status transition" });
        if (err.message === "FORBIDDEN") return res.status(403).json({ message: "Forbidden" });
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const assignValidators = [body("assigneeId").isMongoId().notEmpty()];

export async function assignController(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { issueId } = req.params;
    const { assigneeId } = req.body;
    try {
        const result = await assignIssue(issueId, assigneeId, userId);
        return res.json(result);
    } catch (err: any) {
        if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Issue not found" });
        if (err.message === "PROJECT_NOT_FOUND") return res.status(404).json({ message: "Project not found" });
        if (err.message === "FORBIDDEN") return res.status(403).json({ message: "Forbidden" });
        if (err.message === "ASSIGNEE_NOT_MEMBER") return res.status(403).json({ message: "Assignee must be a project member" });
        return res.status(500).json({ message: "Internal server error" });
    }
}
