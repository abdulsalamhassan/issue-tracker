type Props = {
    message: string;
};

export default function ErrorState({ message }: Props) {
    return (
        <div className="dt-card border-red-200 bg-red-50/40 p-4 text-sm text-red-700">
            {message}
        </div>
    );
}
