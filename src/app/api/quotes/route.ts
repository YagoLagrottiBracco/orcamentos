import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuotePdf } from "@/lib/pdf";
import { sendQuoteEmail } from "@/lib/email";

type SessionUser = { id?: string; role?: string };

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const user = session.user as SessionUser;
    if (user.role !== "admin") return NextResponse.json({ error: "Apenas administradores podem criar orçamentos." }, { status: 403 });

    try {
        const { requestId, description, price, deadline, startDate, paymentMethods, notes } = await req.json();

        if (!requestId || !description || !price || !deadline || !startDate || !paymentMethods) {
            return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
        }

        // Check if request exists
        const request = await prisma.request.findUnique({
            where: { id: requestId },
            include: { user: true },
        });
        if (!request) return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });

        // Check existing quote
        const existingQuote = await prisma.quote.findUnique({ where: { requestId } });
        if (existingQuote) return NextResponse.json({ error: "Orçamento já existe para esta solicitação." }, { status: 409 });

        // Create quote
        const quote = await prisma.quote.create({
            data: { requestId, description, price: Number(price), deadline, startDate, paymentMethods, notes },
        });

        // Update request status
        await prisma.request.update({ where: { id: requestId }, data: { status: "quoted" } });

        // Generate PDF
        let pdfUrl: string | null = null;
        try {
            pdfUrl = await generateQuotePdf(quote, request, request.user);
            await prisma.quote.update({ where: { id: quote.id }, data: { pdfUrl } });
        } catch (pdfError) {
            console.error("Erro ao gerar PDF:", pdfError);
        }

        // Send email
        await sendQuoteEmail(
            request.user.email,
            request.user.name,
            request.serviceType,
            Number(price),
            requestId,
            pdfUrl || ""
        );

        return NextResponse.json({ ...quote, pdfUrl }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}
