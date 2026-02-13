import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { createProject, getProjectsForUser, getProjectById, addMemberToProject } from "../services/project.service";
import { getDashboardMetricsForUser } from "../services/metrics.service";

export const createValidators = [
    body("name").isString().notEmpty(),
    body("key").isString().isLength({ min: 2, max: 10 }).matches(/^[A-Z0-9]+$/)
];

export async function createProjectController(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { name, key, description } = req.body;
    try {
        const project = await createProject(userId, name, key, description);
        return res.status(201).json({ project });
    } catch (err: any) {
        if (err.code === 11000) return res.status(409).json({ message: "Duplicate key" });
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getProjectsController(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const projects = await getProjectsForUser(userId);
    return res.json({ projects });
}

export async function getProjectController(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { projectId } = req.params;
    const project = await getProjectById(projectId, userId);
    if (!project) return res.status(404).json({ message: "Not found or access denied" });
    return res.json({ project });
}

export async function addMemberController(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { projectId } = req.params;
    const { memberId } = req.body;
    try {
        const result = await addMemberToProject(projectId, userId, memberId);
        return res.json({ project: result });
    } catch (err: any) {
        if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Project not found" });
        if (err.message === "FORBIDDEN") return res.status(403).json({ message: "Only owner can add members" });
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getDashboardMetricsController(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
        const metrics = await getDashboardMetricsForUser(userId);
        return res.json(metrics);
    } catch (err: any) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
