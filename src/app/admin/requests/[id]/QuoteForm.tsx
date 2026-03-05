"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RequestData {
    id: string;
    serviceType: string;
    description: string;
    additionalInfo?: string | null;
    status: string;
    user: { name: string; email: string };
}

export default function QuoteForm({ request }: { request: RequestData }) {
    const router = useRouter();
    const [form, setForm] = useState({
        description: "",
        price: "",
        deadline: "",
        startDate: "",
        paymentMethods: "",
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("Enviar orçamento para o cliente? Isso gerará um PDF e enviará um e-mail.")) return;
        setError("");
        setLoading(true);

        const res = await fetch("/api/quotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId: request.id, ...form, price: Number(form.price) }),
        });

        const data = await res.json();
        if (!res.ok) {
            setError(data.error || "Erro ao criar orçamento.");
            setLoading(false);
        } else {
            router.push("/admin");
            router.refresh();
        }
    };

    if (request.status === "quoted") {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm font-medium">
                ✅ Orçamento já enviado para este cliente.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição do Serviço *</label>
                <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Descreva o que será entregue..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 resize-none text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Valor (R$) *</label>
                    <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="1500.00"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Prazo Estimado *</label>
                    <input
                        type="text"
                        required
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        placeholder="Ex: 15 dias úteis"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de Início *</label>
                    <input
                        type="date"
                        required
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Formas de Pagamento *</label>
                    <input
                        type="text"
                        required
                        value={form.paymentMethods}
                        onChange={(e) => setForm({ ...form, paymentMethods: e.target.value })}
                        placeholder="PIX, Boleto, Cartão..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Observações <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Informações adicionais para o cliente..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 resize-none text-sm"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
            >
                {loading ? "Gerando PDF e enviando..." : "📤 Enviar Orçamento ao Cliente"}
            </button>
        </form>
    );
}
