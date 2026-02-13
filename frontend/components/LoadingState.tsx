type Props = {
    label?: string;
    fullScreen?: boolean;
};

export default function LoadingState({ label = "Loading...", fullScreen = false }: Props) {
    const content = (
        <div className="flex items-center gap-3">
            <span
                className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"
                aria-hidden="true"
            />
            <span>{label}</span>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
                <div className="dt-card w-full max-w-sm p-6 text-sm text-slate-600">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className="dt-card p-5 text-sm text-slate-600">
            {content}
        </div>
    );
}
