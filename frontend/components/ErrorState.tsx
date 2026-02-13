type Props = {
    message: string;
};

export default function ErrorState({ message }: Props) {
    return (
        <div className="dt-card border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 rounded-full border border-red-300 bg-white text-[10px] font-bold leading-[14px] text-red-600">
                    !
                </span>
                <span>{message}</span>
            </div>
        </div>
    );
}
