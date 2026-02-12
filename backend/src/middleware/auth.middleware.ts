import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import config from "../config";
import { extractAuthToken } from "../utils/httpAuth";

export interface RequestWithUser extends Request {
    userId?: string;
}

export function authMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
    const token = extractAuthToken(req, config.AUTH_COOKIE_NAME);
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
        const payload = verifyToken(token);
        if (payload && typeof payload.sub === "string") {
            req.userId = payload.sub;
            return next();
        }
        if (payload && (payload.uid || payload.id)) {
            req.userId = String((payload as any).uid || (payload as any).id);
            return next();
        }
        return res.status(401).json({ message: "Invalid token payload" });
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
