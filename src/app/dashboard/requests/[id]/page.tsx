import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

type SessionUser = { id?: string; role?: string };

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const user = session.user as SessionUser;
    const { id } = await params;

    const request = await prisma.request.findUnique({
        where: { id },
        include: { user: { select: { name: true, email: true } }, quote: true },
    });

    if (!request || request.userId !== user.id) notFound();

    const quote = request.quote;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Voltar ao painel</Link>
                <div className="flex items-center gap-3 mt-2">
                    <h1 className="text-2xl font-bold text-gray-900">Solicitação de Orçamento</h1>
                    <StatusBadge status={request.status} />
                </div>
                <p className="text-gray-500 mt-1 text-sm">Enviada em {new Date(request.createdAt).toLocaleDateString("pt-BR")}</p>
            </div>

            {/* Request details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="font-semibold text-gray-800 mb-4">Detalhes da Solicitação</h2>
                <dl className="space-y-4">
                    <div>
                        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo de Serviço</dt>
                        <dd className="text-gray-900 mt-1">{request.serviceType}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição</dt>
                        <dd className="text-gray-900 mt-1">{request.description}</dd>
                    </div>
                    {request.additionalInfo && (
                        <div>
                            <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Informações Adicionais</dt>
                            <dd className="text-gray-900 mt-1">{request.additionalInfo}</dd>
                        </div>
                    )}
                </dl>
            </div>

            {/* Quote */}
            {quote ? (
                <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-800">Orçamento Recebido</h2>
                        {quote.pdfUrl && (
                            <a
                                href={quote.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-1.5"
                            >
                                📄 Baixar PDF
                            </a>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                        <p className="text-xs text-gray-500 mb-1">Valor Total</p>
                        <p className="text-3xl font-bold text-blue-700">
                            {quote.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                    </div>

                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição do Serviço</dt>
                            <dd className="text-gray-900 mt-1 text-sm">{quote.description}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Prazo Estimado</dt>
                            <dd className="text-gray-900 mt-1 text-sm">{quote.deadline}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data de Início</dt>
                            <dd className="text-gray-900 mt-1 text-sm">
                                {new Date(quote.startDate + "T12:00:00").toLocaleDateString("pt-BR")}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Formas de Pagamento</dt>
                            <dd className="text-gray-900 mt-1 text-sm">{quote.paymentMethods}</dd>
                        </div>
                        {quote.notes && (
                            <div className="md:col-span-2">
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Observações</dt>
                                <dd className="text-gray-900 mt-1 text-sm">{quote.notes}</dd>
                            </div>
                        )}
                    </dl>

                    <p className="text-xs text-gray-400 mt-4">
                        Orçamento criado em {new Date(quote.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
                    <div className="text-3xl mb-2">⏳</div>
                    <h3 className="text-gray-700 font-medium mb-1">Aguardando orçamento</h3>
                    <p className="text-gray-400 text-sm">Você será notificado por e-mail quando o orçamento estiver disponível.</p>
                </div>
            )}
        </div>
    );
}
