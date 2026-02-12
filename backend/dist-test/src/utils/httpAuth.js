"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAuthToken = extractAuthToken;
function extractAuthToken(req, cookieName) {
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
