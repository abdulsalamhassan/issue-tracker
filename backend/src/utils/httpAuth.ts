import { Request } from "express";

export function extractAuthToken(req: Request, cookieName: string): string | null {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) {
        const token = auth.replace(/^Bearer\s+/, "").trim();
        return token || null;
    }

    const cookieToken = req.cookies?.[cookieName];
    if (typeof cookieToken === "string" && cookieToken.trim()) {
        return cookieToken.trim();
    }

    return null;
}

