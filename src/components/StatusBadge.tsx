type Status = "pending" | "quoted" | string;

const config: Record<string, { label: string; classes: string }> = {
    pending: { label: "Pendente", classes: "bg-yellow-100 text-yellow-800" },
    quoted: { label: "Orçado", classes: "bg-green-100 text-green-800" },
};

export default function StatusBadge({ status }: { status: Status }) {
    const s = config[status] ?? { label: status, classes: "bg-gray-100 text-gray-700" };
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${s.classes}`}>{s.label}</span>
    );
}
