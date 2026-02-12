import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Project } from "../models/Project";

interface ReqWithUser extends Request {
    userId?: string;
}

export function validateProjectIdParam(req: Request, res: Response, next: NextFunction) {
    const { projectId } = req.params;
    if (!projectId || !Types.ObjectId.isValid(projectId)) return res.status(400).json({ message: "Invalid projectId" });
    return next();
}

export function validateMemberIdBody(req: Request, res: Response, next: NextFunction) {
    const { memberId } = req.body;
    if (!memberId || !Types.ObjectId.isValid(memberId)) return res.status(400).json({ message: "Invalid memberId" });
    return next();
}

export async function projectOwnerOnly(req: ReqWithUser, res: Response, next: NextFunction) {
    const userId = req.userId;
    const { projectId } = req.params;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const proj = await Project.findById(projectId).select("owner").lean();
    if (!proj) return res.status(404).json({ message: "Project not found" });
    if (String(proj.owner) !== String(userId)) return res.status(403).json({ message: "Forbidden" });
    return next();
}
