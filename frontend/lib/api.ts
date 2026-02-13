import type {
    AssignIssueResponse,
    AuthResponse,
    Issue,
    IssuePriority,
    IssueResponse,
    IssueStatus,
    MeResponse,
    PaginatedResponse,
    ProjectMembersResponse,
    ProjectResponse,
    ProjectsResponse
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const DEFAULT_TIMEOUT_MS = 10000;

type ApiErrorBody = {
    message?: string;
    error?: string;
    errors?: Array<{ msg?: string }>;
};

export class ApiRequestError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "ApiRequestError";
        this.status = status;
    }
}

function toErrorMessage(raw: string, statusText: string): string {
    if (!raw) return statusText || "Request failed";
    try {
        const parsed = JSON.parse(raw) as ApiErrorBody;
        if (parsed.message) return parsed.message;
        if (parsed.error) return parsed.error;
        if (parsed.errors?.length && parsed.errors[0]?.msg) return parsed.errors[0].msg as string;
    } catch {
        // Fall back to raw text if not JSON
    }
    return raw;
}

export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    if (init?.signal) {
        if (init.signal.aborted) {
            controller.abort();
        } else {
            init.signal.addEventListener("abort", () => controller.abort(), { once: true });
        }
    }

    let res: Response;

    try {
        res = await fetch(`${API_BASE}${path}`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(init?.headers || {})
            },
            ...init,
            signal: controller.signal
        });
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new ApiRequestError("Request timed out. Please try again.");
        }
        throw new ApiRequestError("Network error. Please check your connection and try again.");
    } finally {
        clearTimeout(timeout);
    }

    if (!res.ok) {
        const text = await res.text();
        throw new ApiRequestError(toErrorMessage(text, res.statusText), res.status);
    }

    if (res.status === 204) {
        return undefined as T;
    }

    return (await res.json()) as T;
}

export function getMe() {
    return apiFetch<MeResponse>("/auth/me");
}

export function login(payload: { email: string; password: string }) {
    return apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

export function register(payload: { name: string; email: string; password: string }) {
    return apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

export function logout() {
    return apiFetch<void>("/auth/logout", {
        method: "POST"
    });
}

export function getProjects() {
    return apiFetch<ProjectsResponse>("/projects");
}

export function getDashboardMetrics() {
    return apiFetch<{
        totalIssues: number;
        inProgress: number;
        done: number;
        open: number;
        archived: number;
        projectsInProgress: number;
        projectsDone: number;
    }>("/projects/metrics");
}

export function createProject(payload: { name: string; key: string; description?: string }) {
    return apiFetch<ProjectResponse>("/projects", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

export function getProject(projectId: string) {
    return apiFetch<ProjectResponse>(`/projects/${projectId}`);
}

export function addProjectMember(projectId: string, memberId: string) {
    return apiFetch<ProjectMembersResponse>(`/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ memberId })
    });
}

export function getIssues(
    projectId: string,
    filters: { status?: string; priority?: string; page?: number; limit?: number }
) {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    return apiFetch<PaginatedResponse<Issue>>(`/projects/${projectId}/issues?${params.toString()}`);
}

export function createIssue(payload: {
    projectId: string;
    title: string;
    description?: string;
    priority?: IssuePriority;
}) {
    return apiFetch<IssueResponse>(`/projects/${payload.projectId}/issues`, {
        method: "POST",
        body: JSON.stringify({
            title: payload.title,
            description: payload.description,
            priority: payload.priority
        })
    });
}

export function updateIssueStatus(issueId: string, status: IssueStatus) {
    return apiFetch<{ id: string; status: IssueStatus }>(`/issues/${issueId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
    });
}

export function assignIssue(issueId: string, assigneeId: string) {
    return apiFetch<AssignIssueResponse>(`/issues/${issueId}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ assigneeId })
    });
}

export function getIssue(issueId: string) {
    return apiFetch<IssueResponse>(`/issues/${issueId}`);
}
