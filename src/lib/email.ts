import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendQuoteEmail(
    to: string,
    clientName: string,
    serviceType: string,
    price: number,
    requestId: string,
    pdfUrl: string
) {
    const platformUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const quoteViewUrl = `${platformUrl}/dashboard/requests/${requestId}`;
    const priceFormatted = price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 30px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .header { background: #1a4a99; color: white; padding: 30px 40px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0; opacity: 0.8; font-size: 14px; }
        .content { padding: 30px 40px; }
        .content p { color: #333; line-height: 1.6; }
        .highlight { background: #f0f5ff; border-left: 4px solid #1a4a99; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
        .highlight .price { font-size: 26px; font-weight: bold; color: #1a4a99; }
        .highlight .service { font-size: 13px; color: #666; margin-bottom: 5px; }
        .btn { display: inline-block; background: #1a4a99; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        .footer { background: #f8f9fb; padding: 20px 40px; font-size: 12px; color: #999; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Seu orçamento está pronto! 🎉</h1>
          <p>Plataforma de Orçamentos</p>
        </div>
        <div class="content">
          <p>Olá, <strong>${clientName}</strong>!</p>
          <p>Seu pedido de orçamento para <strong>${serviceType}</strong> foi analisado e está disponível.</p>
          <div class="highlight">
            <div class="service">Serviço: ${serviceType}</div>
            <div class="price">${priceFormatted}</div>
          </div>
          <p>Acesse a plataforma para ver todos os detalhes, incluindo prazo, formas de pagamento e observações. O PDF do orçamento também está disponível para download.</p>
          <a href="${quoteViewUrl}" class="btn">Ver Orçamento Completo</a>
        </div>
        <div class="footer">
          <p>Este email foi enviado automaticamente. Em caso de dúvidas, entre em contato conosco.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject: `Orçamento Disponível – ${serviceType}`,
            html,
        });
        console.log(`📧 Email enviado para ${to}`);
    } catch (error) {
        // Em desenvolvimento, apenas logar o erro sem quebrar o fluxo
        console.error("Erro ao enviar email (verifique as configurações SMTP no .env.local):", error);
    }
}
