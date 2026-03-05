import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

interface QuoteData {
    id: string;
    description: string;
    price: number;
    deadline: string;
    startDate: string;
    paymentMethods: string;
    notes?: string | null;
    createdAt: Date;
}

interface RequestData {
    id: string;
    serviceType: string;
    description: string;
}

interface UserData {
    name: string;
    email: string;
}

export async function generateQuotePdf(
    quote: QuoteData,
    request: RequestData,
    user: UserData
): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const primaryColor = rgb(0.1, 0.3, 0.6);
    const darkGray = rgb(0.2, 0.2, 0.2);
    const lightGray = rgb(0.6, 0.6, 0.6);

    // Header background
    page.drawRectangle({
        x: 0,
        y: height - 100,
        width,
        height: 100,
        color: primaryColor,
    });

    // Title
    page.drawText("ORÇAMENTO", {
        x: 50,
        y: height - 50,
        size: 28,
        font: fontBold,
        color: rgb(1, 1, 1),
    });

    page.drawText(`Nº ${quote.id.slice(0, 8).toUpperCase()}`, {
        x: 50,
        y: height - 75,
        size: 11,
        font: fontRegular,
        color: rgb(0.8, 0.9, 1),
    });

    const dateStr = new Date(quote.createdAt).toLocaleDateString("pt-BR");
    page.drawText(`Data: ${dateStr}`, {
        x: width - 180,
        y: height - 60,
        size: 11,
        font: fontRegular,
        color: rgb(0.8, 0.9, 1),
    });

    // Client info section
    let y = height - 140;
    page.drawText("DADOS DO CLIENTE", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: lightGray,
    });

    y -= 20;
    page.drawText(`Nome: ${user.name}`, { x: 50, y, size: 12, font: fontRegular, color: darkGray });
    y -= 18;
    page.drawText(`E-mail: ${user.email}`, { x: 50, y, size: 12, font: fontRegular, color: darkGray });

    // Divider
    y -= 20;
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });

    // Service section
    y -= 25;
    page.drawText("SERVIÇO SOLICITADO", { x: 50, y, size: 11, font: fontBold, color: lightGray });
    y -= 20;
    page.drawText(`Tipo: ${request.serviceType}`, { x: 50, y, size: 12, font: fontRegular, color: darkGray });
    y -= 18;

    // Wrap description text
    const descWords = request.description.split(" ");
    let line = "";
    for (const word of descWords) {
        if ((line + word).length > 80) {
            page.drawText(line.trim(), { x: 50, y, size: 11, font: fontRegular, color: darkGray });
            y -= 16;
            line = word + " ";
        } else {
            line += word + " ";
        }
    }
    if (line.trim()) {
        page.drawText(line.trim(), { x: 50, y, size: 11, font: fontRegular, color: darkGray });
        y -= 16;
    }

    // Divider
    y -= 15;
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });

    // Quote details
    y -= 25;
    page.drawText("DETALHES DO ORÇAMENTO", { x: 50, y, size: 11, font: fontBold, color: lightGray });
    y -= 20;

    const details = [
        { label: "Descrição do Serviço", value: quote.description },
        { label: "Prazo Estimado", value: quote.deadline },
        { label: "Data de Início", value: new Date(quote.startDate + "T12:00:00").toLocaleDateString("pt-BR") },
        { label: "Formas de Pagamento", value: quote.paymentMethods },
    ];

    for (const detail of details) {
        page.drawText(`${detail.label}:`, { x: 50, y, size: 11, font: fontBold, color: darkGray });
        y -= 16;
        // Wrap value
        const words = detail.value.split(" ");
        let l = "";
        for (const word of words) {
            if ((l + word).length > 85) {
                page.drawText(l.trim(), { x: 50, y, size: 11, font: fontRegular, color: darkGray });
                y -= 15;
                l = word + " ";
            } else {
                l += word + " ";
            }
        }
        if (l.trim()) {
            page.drawText(l.trim(), { x: 50, y, size: 11, font: fontRegular, color: darkGray });
            y -= 15;
        }
        y -= 8;
    }

    // Price highlight box
    y -= 15;
    page.drawRectangle({ x: 50, y: y - 10, width: width - 100, height: 50, color: rgb(0.95, 0.97, 1) });
    page.drawRectangle({ x: 50, y: y - 10, width: 4, height: 50, color: primaryColor });
    page.drawText("VALOR TOTAL:", { x: 65, y: y + 20, size: 11, font: fontBold, color: lightGray });
    const priceFormatted = quote.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    page.drawText(priceFormatted, { x: 65, y: y + 2, size: 20, font: fontBold, color: primaryColor });
    y -= 30;

    // Notes
    if (quote.notes) {
        y -= 20;
        page.drawText("OBSERVAÇÕES:", { x: 50, y, size: 11, font: fontBold, color: darkGray });
        y -= 16;
        page.drawText(quote.notes, { x: 50, y, size: 10, font: fontRegular, color: darkGray });
        y -= 15;
    }

    // Footer
    page.drawLine({ start: { x: 50, y: 60 }, end: { x: width - 50, y: 60 }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
    page.drawText("Este orçamento foi gerado eletronicamente.", { x: 50, y: 40, size: 9, font: fontRegular, color: lightGray });
    page.drawText("Dúvidas? Entre em contato conosco.", { x: 50, y: 25, size: 9, font: fontRegular, color: lightGray });

    // Save to file
    const pdfBytes = await pdfDoc.save();
    const pdfsDir = path.join(process.cwd(), "public", "pdfs");
    if (!fs.existsSync(pdfsDir)) {
        fs.mkdirSync(pdfsDir, { recursive: true });
    }
    const filename = `orcamento-${quote.id}.pdf`;
    const filepath = path.join(pdfsDir, filename);
    fs.writeFileSync(filepath, pdfBytes);

    return `/pdfs/${filename}`;
}
