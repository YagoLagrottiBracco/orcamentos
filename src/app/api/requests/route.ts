import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SessionUser = { id?: string; role?: string };

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const user = session.user as SessionUser;

    try {
        const where = user.role === "admin" ? {} : { userId: user.id };
        const requests = await prisma.request.findMany({
            where,
            include: { user: { select: { name: true, email: true } }, quote: true },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(requests);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const user = session.user as SessionUser;
    if (user.role === "admin") return NextResponse.json({ error: "Admin não pode criar solicitações." }, { status: 403 });

    try {
        const { serviceType, description, additionalInfo } = await req.json();
        if (!serviceType || !description) {
            return NextResponse.json({ error: "Tipo de serviço e descrição são obrigatórios." }, { status: 400 });
        }

        const request = await prisma.request.create({
            data: { userId: user.id!, serviceType, description, additionalInfo },
        });

        return NextResponse.json(request, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}
