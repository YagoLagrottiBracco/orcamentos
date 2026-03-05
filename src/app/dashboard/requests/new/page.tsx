"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SERVICE_TYPES = [
    "Montagem de móveis",
    "Instalação de ar-condicionado",
    "Instalação de ventilador de teto",
    "Instalação de TV na parede",
    "Instalação de prateleiras e suportes",
    "Instalação de cortinas e persianas",
    "Instalação de fechaduras e dobradiças",
    "Instalação de chuveiro e torneira",
    "Troca de tomadas e interruptores",
    "Pequenos reparos elétricos",
    "Conserto de vazamentos",
    "Pintura de ambientes",
    "Rejunte e silicone",
    "Assentamento de azulejos e pisos",
    "Instalação de portas e janelas",
    "Furos e fixações em geral",
    "Limpeza de caixa d'água",
    "Pequenas reformas",
    "Outros serviços",
];

export default function NewRequestPage() {
    const router = useRouter();
    const [form, setForm] = useState({ serviceType: "", description: "", additionalInfo: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await fetch("/api/requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const data = await res.json();
        if (!res.ok) {
            setError(data.error || "Erro ao enviar solicitação.");
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Voltar ao painel</Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Nova Solicitação de Orçamento</h1>
                <p className="text-gray-500 mt-1 text-sm">Descreva o serviço que você precisa</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Serviço *</label>
                        <select
                            value={form.serviceType}
                            onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                        >
                            <option value="">Selecione um tipo...</option>
                            {SERVICE_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição do Serviço *</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            required
                            rows={4}
                            placeholder="Descreva com detalhes o que você precisa..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Informações Adicionais <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <textarea
                            value={form.additionalInfo}
                            onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
                            rows={3}
                            placeholder="Prazo desejado, referências, informações extras..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Link
                            href="/dashboard"
                            className="flex-1 text-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm text-sm"
                        >
                            {loading ? "Enviando..." : "Enviar Solicitação"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
