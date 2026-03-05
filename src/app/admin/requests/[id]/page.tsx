import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import QuoteForm from "./QuoteForm";

export default async function AdminRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const request = await prisma.request.findUnique({
        where: { id },
        include: {
            user: { select: { name: true, email: true } },
            quote: true,
        },
    });

    if (!request) notFound();

    const quote = request.quote;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">← Voltar ao painel</Link>
                <div className="flex items-center gap-3 mt-2">
                    <h1 className="text-2xl font-bold text-gray-900">Solicitação de Orçamento</h1>
                    <StatusBadge status={request.status} />
                </div>
            </div>

            {/* Client info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
                <h2 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider text-gray-400">Cliente</h2>
                <p className="font-medium text-gray-900">{request.user.name}</p>
                <p className="text-sm text-gray-500">{request.user.email}</p>
            </div>

            {/* Request details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="font-semibold text-gray-800 mb-4">Solicitação</h2>
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
                    <div>
                        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Enviada em</dt>
                        <dd className="text-gray-700 mt-1 text-sm">{new Date(request.createdAt).toLocaleDateString("pt-BR")}</dd>
                    </div>
                </dl>
            </div>

            {/* Existing quote display or form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">
                    {quote ? "Orçamento Enviado" : "Criar Orçamento"}
                </h2>

                {quote ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Valor Total</p>
                            <p className="text-3xl font-bold text-blue-700">
                                {quote.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </p>
                        </div>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Prazo</dt>
                                <dd className="text-gray-900 mt-1 text-sm">{quote.deadline}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data de Início</dt>
                                <dd className="text-gray-900 mt-1 text-sm">
                                    {new Date(quote.startDate + "T12:00:00").toLocaleDateString("pt-BR")}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pagamentos</dt>
                                <dd className="text-gray-900 mt-1 text-sm">{quote.paymentMethods}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Criado em</dt>
                                <dd className="text-gray-900 mt-1 text-sm">{new Date(quote.createdAt).toLocaleDateString("pt-BR")}</dd>
                            </div>
                            <div className="col-span-2">
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição</dt>
                                <dd className="text-gray-900 mt-1 text-sm">{quote.description}</dd>
                            </div>
                            {quote.notes && (
                                <div className="col-span-2">
                                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Observações</dt>
                                    <dd className="text-gray-900 mt-1 text-sm">{quote.notes}</dd>
                                </div>
                            )}
                        </dl>
                        {quote.pdfUrl && (
                            <a
                                href={quote.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                📄 Ver PDF do Orçamento
                            </a>
                        )}
                    </div>
                ) : (
                    <QuoteForm request={request} />
                )}
            </div>
        </div>
    );
}
