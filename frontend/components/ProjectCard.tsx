import Link from "next/link";
import type { Project } from "../types";

type Props = {
    project: Project;
};

export default function ProjectCard({ project }: Props) {
    return (
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
                    <p className="text-sm text-slate-600">{project.description || "No description provided."}</p>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{project.key}</span>
            </div>
            <div className="mt-4">
                <Link
                    href={`/projects/${project.id}/issues`}
                    className="inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    View Issues
                </Link>
            </div>
        </div>
    );
}
