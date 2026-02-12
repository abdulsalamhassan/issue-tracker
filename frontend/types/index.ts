export type UserRole = "user" | "admin";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface Project {
    id: string;
    name: string;
    key: string;
    description?: string;
    owner: string;
    members?: string[];
}

export type IssueStatus = "open" | "in_progress" | "closed" | "archived";
export type IssuePriority = "low" | "medium" | "high" | "critical";

export interface Issue {
    id?: string;
    _id?: string;
    title: string;
    description?: string;
    status: IssueStatus;
    priority: IssuePriority;
    assignees: string[];
    reporter?: string;
    project?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

export interface MeResponse {
    user: User;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ProjectsResponse {
    projects: Project[];
}

export interface ProjectResponse {
    project: Project;
}

export interface IssueResponse {
    issue: Issue;
}

export interface ProjectMembersResponse {
    project: {
        id: string;
        members: string[];
    };
}

export interface AssignIssueResponse {
    id: string;
    assignees: string[];
}
