"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addProjectMember, createProject, getProjects } from "../../lib/api";
import type { Project } from "../../types";
import ProjectCard from "../../components/ProjectCard";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";

export default function ProjectsPage() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [key, setKey] = useState("");
    const [description, setDescription] = useState("");
    const [search, setSearch] = useState("");
    const [memberProjectId, setMemberProjectId] = useState<string | null>(null);
    const [memberId, setMemberId] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [memberError, setMemberError] = useState<string | null>(null);

    const projectsQuery = useQuery({
        queryKey: ["projects"],
        queryFn: getProjects
    });

    const createProjectMutation = useMutation({
        mutationFn: createProject,
        onSuccess: async () => {
            setShowForm(false);
            setName("");
            setKey("");
            setDescription("");
            setError(null);
            await queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
        onError: (err: Error) => setError(err.message)
    });

    const addMemberMutation = useMutation({
        mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) => addProjectMember(projectId, userId),
        onSuccess: async () => {
            setMemberProjectId(null);
            setMemberId("");
            setMemberError(null);
            await queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
        onError: (err: Error) => setMemberError(err.message)
    });

    const handleCreate = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        createProjectMutation.mutate({
            name,
            key: key.trim().toUpperCase(),
            description: description || undefined
        });
    };

    const handleAddMember = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!memberProjectId) return;
        setMemberError(null);
        addMemberMutation.mutate({ projectId: memberProjectId, userId: memberId });
    };

    const filteredProjects = useMemo(() => {
        if (!projectsQuery.data?.projects) return [];
        const term = search.trim().toLowerCase();
        if (!term) return projectsQuery.data.projects;
        return projectsQuery.data.projects.filter((project) => {
            return (
                project.name.toLowerCase().includes(term) ||
                project.key.toLowerCase().includes(term) ||
                (project.description || "").toLowerCase().includes(term)
            );
        });
    }, [projectsQuery.data?.projects, search]);
    const selectedProject = filteredProjects.find((project) => project.id === memberProjectId) || null;

    return (
        <div className="dt-page">
            <div className="flex items-center justify-between">
                <h1 className="dt-title">Your Projects</h1>
                <button
                    type="button"
                    onClick={() => setShowForm((prev) => !prev)}
                    className="dt-btn-primary"
                >
                    {showForm ? "Cancel" : "New Project"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="dt-card space-y-4 p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Project Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="dt-input"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Project Key</label>
                            <input
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                className="dt-input"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="dt-input"
                            rows={3}
                        />
                    </div>
                    {error && <ErrorState message={error} />}
                    <button
                        type="submit"
                        className="dt-btn-primary"
                        disabled={createProjectMutation.isPending}
                    >
                        {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                    </button>
                </form>
            )}

            {projectsQuery.isLoading && <LoadingState label="Loading projects..." />}
            {projectsQuery.isError && <ErrorState message={projectsQuery.error.message} />}

            {projectsQuery.isSuccess && (
                <div className="space-y-4">
                    <div className="dt-panel flex items-center gap-3">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search projects..."
                            className="dt-input"
                        />
                    </div>

                    {filteredProjects.length === 0 ? (
                        <LoadingState label="No projects found." />
                    ) : (
                        <>
                            <div className="dt-card hidden overflow-hidden lg:block">
                                <table className="dt-table">
                                    <thead className="dt-thead">
                                        <tr>
                                            <th className="px-4 py-3">Project Name</th>
                                            <th className="px-4 py-3">Role</th>
                                            <th className="px-4 py-3">Project Key</th>
                                            <th className="px-4 py-3">Members</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProjects.map((project: Project) => (
                                            <tr key={project.id} className="dt-row">
                                                <td className="px-4 py-4">
                                                    <p className="font-medium text-slate-900">{project.name}</p>
                                                    <p className="text-xs text-slate-500">{project.description || "No description provided."}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700">Admin</span>
                                                </td>
                                                <td className="px-4 py-4 text-slate-600">{project.key}</td>
                                                <td className="px-4 py-4 text-slate-600">{project.members?.length ?? 0}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setMemberProjectId(project.id);
                                                                setMemberError(null);
                                                            }}
                                                            className="dt-btn-ghost"
                                                        >
                                                            Add Member
                                                        </button>
                                                        <Link
                                                            href={`/projects/${project.id}/issues`}
                                                            className="dt-btn-primary inline-flex px-3 py-2 text-xs"
                                                        >
                                                            View Issues
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {memberProjectId && (
                                <form onSubmit={handleAddMember} className="dt-card space-y-3 p-4">
                                    <p className="text-sm font-medium text-slate-800">
                                        Add member to {selectedProject ? `"${selectedProject.name}"` : "selected project"}
                                    </p>
                                    <p className="text-xs text-slate-500">Paste a valid MongoDB user ObjectId. Only project owner can add members.</p>
                                    <div className="flex flex-col gap-2 md:flex-row">
                                        <input
                                            value={memberId}
                                            onChange={(e) => setMemberId(e.target.value)}
                                            placeholder="User ObjectId"
                                            className="dt-input"
                                            required
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="submit"
                                                className="dt-btn-primary px-3 py-2"
                                                disabled={addMemberMutation.isPending}
                                            >
                                                {addMemberMutation.isPending ? "Adding..." : "Add"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMemberProjectId(null);
                                                    setMemberId("");
                                                    setMemberError(null);
                                                }}
                                                className="dt-btn-secondary px-3 py-2"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                    {memberError && <ErrorState message={memberError} />}
                                </form>
                            )}

                            <div className="grid gap-4 lg:hidden">
                                {filteredProjects.map((project: Project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
