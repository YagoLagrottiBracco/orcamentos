import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

type SessionUser = { id?: string; role?: string };

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const user = session.user as SessionUser;

    const requests = await prisma.request.findMany({
        where: { userId: user.id },
        include: { quote: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Meu Painel</h1>
                    <p className="text-gray-500 mt-1 text-sm">Gerencie suas solicitações de orçamento</p>
                </div>
                <Link
                    href="/dashboard/requests/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2"
                >
                    + Nova Solicitação
                </Link>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <h3 className="text-gray-700 font-semibold mb-1">Nenhuma solicitação ainda</h3>
                    <p className="text-gray-400 text-sm mb-4">Crie sua primeira solicitação de orçamento</p>
                    <Link
                        href="/dashboard/requests/new"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                        Criar solicitação
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo de Serviço</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Data</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 truncate max-w-[200px]">{req.serviceType}</div>
                                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{req.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                                        {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/dashboard/requests/${req.id}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Ver →
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
