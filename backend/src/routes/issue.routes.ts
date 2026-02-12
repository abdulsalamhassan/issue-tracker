import { Router } from "express";
import {
    createIssueController,
    listIssuesController,
    getIssueController,
    updateStatusController,
    assignController,
    createValidators,
    listValidators,
    statusValidators,
    assignValidators
} from "../controllers/issue.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateProjectIdParam, validateIssueIdParam, ensureProjectMember } from "../middleware/issue.middleware";

const router = Router();

// POST /projects/:projectId/issues
router.post("/projects/:projectId/issues", authMiddleware, validateProjectIdParam, ensureProjectMember, createValidators, createIssueController);
// GET /projects/:projectId/issues
router.get("/projects/:projectId/issues", authMiddleware, validateProjectIdParam, ensureProjectMember, listValidators, listIssuesController);
// GET /issues/:issueId
router.get("/issues/:issueId", authMiddleware, validateIssueIdParam, getIssueController);
// PATCH /issues/:issueId/status
router.patch("/issues/:issueId/status", authMiddleware, validateIssueIdParam, statusValidators, updateStatusController);
// PATCH /issues/:issueId/assign
router.patch("/issues/:issueId/assign", authMiddleware, validateIssueIdParam, assignValidators, assignController);

export default router;
