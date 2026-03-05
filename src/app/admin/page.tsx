import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export default async function AdminPage() {
    const requests = await prisma.request.findMany({
        include: { user: { select: { name: true, email: true } }, quote: true },
        orderBy: { createdAt: "desc" },
    });

    const totalPending = requests.filter((r) => r.status === "pending").length;
    const totalQuoted = requests.filter((r) => r.status === "quoted").length;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Painel do Administrador</h1>
                <p className="text-gray-500 mt-1 text-sm">Gerencie todas as solicitações de orçamento</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                    <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Total</p>
                </div>
                <div className="bg-white rounded-xl border border-yellow-200 p-4 text-center shadow-sm">
                    <p className="text-3xl font-bold text-yellow-600">{totalPending}</p>
                    <p className="text-sm text-gray-500 mt-1">Pendentes</p>
                </div>
                <div className="bg-white rounded-xl border border-green-200 p-4 text-center shadow-sm">
                    <p className="text-3xl font-bold text-green-600">{totalQuoted}</p>
                    <p className="text-sm text-gray-500 mt-1">Orçados</p>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <h3 className="text-gray-700 font-semibold">Nenhuma solicitação ainda</h3>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Serviço</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Data</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 text-sm">{req.user.name}</div>
                                        <div className="text-xs text-gray-400">{req.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 truncate max-w-[160px]">{req.serviceType}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                                        {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/requests/${req.id}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
                                        >
                                            {req.status === "pending" ? "Criar orçamento →" : "Ver →"}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
