"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const httpAuth_1 = require("../src/utils/httpAuth");
function asReq(value) {
    return value;
}
(0, node_test_1.default)("extractAuthToken prefers Bearer token over cookie", () => {
    const req = asReq({
        headers: { authorization: "Bearer header-token" },
        cookies: { token: "cookie-token" }
    });
    strict_1.default.equal((0, httpAuth_1.extractAuthToken)(req, "token"), "header-token");
});
(0, node_test_1.default)("extractAuthToken falls back to cookie token", () => {
    const req = asReq({
        headers: {},
        cookies: { token: "cookie-token" }
    });
    strict_1.default.equal((0, httpAuth_1.extractAuthToken)(req, "token"), "cookie-token");
});
(0, node_test_1.default)("extractAuthToken returns null when no auth is present", () => {
    const req = asReq({
        headers: {},
        cookies: {}
    });
    strict_1.default.equal((0, httpAuth_1.extractAuthToken)(req, "token"), null);
});
