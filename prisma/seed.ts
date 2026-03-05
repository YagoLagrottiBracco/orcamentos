import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // Admin
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

  // Cliente de exemplo
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

  // Pedido de exemplo (pendente)
  const request1 = await prisma.request.create({
    data: {
      userId: client.id,
      serviceType: "Desenvolvimento Web",
      description: "Preciso de um site institucional com 5 páginas e formulário de contato.",
      additionalInfo: "Prazo desejado: 30 dias. Preferência por design moderno.",
      status: "pending",
    },
  });

  // Pedido de exemplo (com orçamento)
  const request2 = await prisma.request.create({
    data: {
      userId: client.id,
      serviceType: "Design Gráfico",
      description: "Logo e identidade visual para minha empresa de consultoria.",
      additionalInfo: "Empresa de tecnologia, gosto de cores azul e cinza.",
      status: "quoted",
    },
  });

  // Orçamento para o pedido 2
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
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
