import test from "node:test";
import assert from "node:assert/strict";
import type { Request } from "express";
import { extractAuthToken } from "../src/utils/httpAuth";

function asReq(value: Partial<Request>): Request {
    return value as Request;
}

test("extractAuthToken prefers Bearer token over cookie", () => {
    const req = asReq({
        headers: { authorization: "Bearer header-token" } as any,
        cookies: { token: "cookie-token" } as any
    });
    assert.equal(extractAuthToken(req, "token"), "header-token");
});

test("extractAuthToken falls back to cookie token", () => {
    const req = asReq({
        headers: {} as any,
        cookies: { token: "cookie-token" } as any
    });
    assert.equal(extractAuthToken(req, "token"), "cookie-token");
});

test("extractAuthToken returns null when no auth is present", () => {
    const req = asReq({
        headers: {} as any,
        cookies: {} as any
    });
    assert.equal(extractAuthToken(req, "token"), null);
});

