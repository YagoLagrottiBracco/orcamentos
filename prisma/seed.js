require("dotenv").config();
// Also load .env.local if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
    require("dotenv").config({ path: ".env.local" });
}
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "file:./prisma/dev.db",
});

async function main() {
    console.log("Iniciando seed...");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@sistema.com" },
        update: {},
        create: {
            name: "Administrador",
            email: "admin@sistema.com",
            password: adminPassword,
            role: "admin",
        },
    });

    const clientPassword = await bcrypt.hash("cliente123", 10);
    const client = await prisma.user.upsert({
        where: { email: "cliente@exemplo.com" },
        update: {},
        create: {
            name: "João Silva",
            email: "cliente@exemplo.com",
            password: clientPassword,
            role: "client",
        },
    });

    const request1 = await prisma.request.create({
        data: {
            userId: client.id,
            serviceType: "Desenvolvimento Web",
            description: "Preciso de um site institucional com 5 páginas e formulário de contato.",
            additionalInfo: "Prazo desejado: 30 dias. Preferência por design moderno.",
            status: "pending",
        },
    });

    const request2 = await prisma.request.create({
        data: {
            userId: client.id,
            serviceType: "Design Gráfico",
            description: "Logo e identidade visual para minha empresa de consultoria.",
            additionalInfo: "Empresa de tecnologia, gosto de cores azul e cinza.",
            status: "quoted",
        },
    });

    await prisma.quote.create({
        data: {
            requestId: request2.id,
            description: "Criação de logotipo + manual de identidade visual com paleta de cores, tipografia e aplicações.",
            price: 1500.0,
            deadline: "15 dias úteis",
            startDate: "2026-03-10",
            paymentMethods: "PIX, Transferência Bancária, Cartão de Crédito (2x sem juros)",
            notes: "Inclui 3 revisões sem custo adicional. Entrega dos arquivos em AI, PNG e PDF.",
        },
    });

    console.log("✅ Seed concluído!");
    console.log("Admin: admin@sistema.com / admin123");
    console.log("Cliente: cliente@exemplo.com / cliente123");
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
