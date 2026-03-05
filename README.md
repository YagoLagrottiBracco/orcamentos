# Plataforma de Orçamentos — MVP

Sistema de solicitação e geração de orçamentos com painel de cliente e admin.

## Stack
- **Frontend/Backend**: Next.js 14 (App Router + API Routes)
- **Banco de dados**: SQLite via Prisma
- **Auth**: NextAuth.js com email/senha
- **Estilo**: TailwindCSS v4
- **PDF**: pdf-lib
- **Email**: nodemailer

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Criar o banco de dados
npx prisma db push

# 3. Popular com dados de exemplo
npx prisma db seed

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Credenciais de Teste

| Usuário        | E-mail                  | Senha       |
|---------------|-------------------------|-------------|
| Administrador | admin@sistema.com       | admin123    |
| Cliente       | cliente@exemplo.com     | cliente123  |

## Configuração de E-mail

Edite `.env.local` com suas credenciais SMTP:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
EMAIL_FROM="Plataforma de Orçamentos <seu-email@gmail.com>"
```

> **Dica**: Para testes locais, use [Mailtrap](https://mailtrap.io) (gratuito). Os erros de email em desenvolvimento **nunca** travam o fluxo.

## Estrutura de Pastas

```
src/
├── app/
│   ├── api/
│   │   ├── auth/        # NextAuth + registro
│   │   ├── requests/    # CRUD de solicitações
│   │   └── quotes/      # Criar orçamento
│   ├── admin/           # Painel do administrador
│   ├── dashboard/       # Painel do cliente
│   ├── login/
│   └── register/
├── components/
│   ├── Navbar.tsx
│   └── StatusBadge.tsx
└── lib/
    ├── auth.ts          # NextAuth config
    ├── email.ts         # Nodemailer
    ├── pdf.ts           # pdf-lib
    └── prisma.ts        # Singleton Prisma client
prisma/
├── schema.prisma        # Modelos: User, Request, Quote
├── seed.ts              # Dados de exemplo
└── dev.db               # Banco SQLite (gerado)
public/
└── pdfs/                # PDFs gerados dos orçamentos
```

## Fluxo Principal

1. **Cliente** cria conta → faz login → solicita orçamento
2. **Admin** acessa `/admin` → abre solicitação → cria orçamento
3. Sistema gera PDF e envia e-mail para o cliente
4. **Cliente** vê o orçamento em `/dashboard/requests/[id]` e baixa o PDF
