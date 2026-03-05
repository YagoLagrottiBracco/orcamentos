import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SessionUser = { id?: string; role?: string };

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const user = session.user as SessionUser;
    const { id } = await params;

    try {
        const request = await prisma.request.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true } },
                quote: true,
            },
        });

        if (!request) return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });

        // Clients can only see their own requests
        if (user.role !== "admin" && request.userId !== user.id) {
            return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
        }

        return NextResponse.json(request);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}
