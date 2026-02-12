type Props = {
    label?: string;
};

export default function LoadingState({ label = "Loading..." }: Props) {
    return (
        <div className="dt-card p-5 text-sm text-slate-600">
            {label}
        </div>
    );
}
