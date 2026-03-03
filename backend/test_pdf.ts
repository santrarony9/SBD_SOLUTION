import PDFDocument from 'pdfkit';
import axios from 'axios';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class MockInvoiceService {
    async generateTestInvoice() {
        const order = await prisma.order.findFirst({
            include: { items: { include: { product: true } }, user: true }
        });
        if (!order) return console.log('No order found');

        return new Promise(async (resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4' });
            doc.pipe(fs.createWriteStream('test_invoice.pdf'));

            try {
                this.generateHeader(doc, "Tax Invoice");
                this.generateCustomerInfo(doc, order, "Invoice Details");
                await this.generateInvoiceTable(doc, order);
                this.generateFooter(doc, order);
                doc.end();
                resolve(true);
            } catch (err) {
                console.error("CRASH DURING PDF", err);
                reject(err);
            }
        });
    }

    private generateHeader(doc: any, title: string) {
        doc.fillColor("#001F3F").fontSize(20).font('Helvetica-Bold').text("SPARK BLUE DIAMOND", 50, 45).fontSize(10).font('Helvetica').text(title, 200, 50, { align: "right" }).moveDown();
        doc.fontSize(10).text("GSTIN: 24AAAAA0000A1Z5", 50, 70).text("PAN: AAAAA0000A", 50, 85).text("Surat, Gujarat, India", 50, 100);
        doc.moveTo(50, 120).lineTo(550, 120).stroke("#EEEEEE");
    }

    private generateCustomerInfo(doc: any, order: any, sectionTitle: string) {
        const shipping = order.shippingAddress as any;
        const billing = order.billingAddress || shipping;
        doc.fontSize(12).font('Helvetica-Bold').text(sectionTitle, 50, 140);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Invoice No: ${order.invoiceNumber || order.id.slice(-8).toUpperCase()}`, 50, 160).text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 175);

        doc.fontSize(12).font('Helvetica-Bold').text("Billing Address", 50, 230);
        doc.fontSize(10).font('Helvetica').text(billing.fullName || 'N/A', 50, 250).text(billing.street || '', 50, 265).text(`${billing.city || ''}, ${billing.state || ''} - ${billing.zip || ''}`, 50, 280);
    }

    private async generateInvoiceTable(doc: any, order: any) {
        let i;
        const invoiceTableTop = 330;
        doc.font('Helvetica-Bold');
        this.generateTableRow(doc, invoiceTableTop, "Item", "HSN", "Qty", "Weight", "Rate", "Total");
        let position = invoiceTableTop + 30;
        for (const item of order.items) {
            const product = item.product;
            if (product.images && product.images[0]) {
                try {
                    const response = await axios.get(product.images[0], { responseType: 'arraybuffer' });
                    doc.image(response.data, 50, position, { width: 30 });
                } catch (e) { console.error("IMAGE FETCH ERROR", e.message); }
            }
            this.generateTableRow(doc, position, product.name, product.hsnCode || "7113", item.quantity.toString(), `${product.realWeight || 0}g`, `₹${item.price}`, `₹${item.price * item.quantity}`);
            position += 50;
        }
    }

    private generateFooter(doc: any, order: any) {
        const amountWords = "RUPEES " + this.numberToWords(Math.round(order.totalAmount * 1.03)) + " ONLY";
        doc.fontSize(10).font('Helvetica-Bold').text("Amount in Words:", 50, doc.y + 40);
        doc.fontSize(10).font('Helvetica').text(amountWords, 50, doc.y + 10);
    }

    private generateTableRow(doc: any, y: number, item: string, hsn: string, qty: string, weight: string, rate: string, total: string) {
        doc.fontSize(10).text(item, 90, y, { width: 150 }).text(hsn, 250, y).text(qty, 300, y).text(weight, 340, y).text(rate, 400, y, { width: 70, align: "right" }).text(total, 480, y, { width: 70, align: "right" });
    }

    private numberToWords(num: number): string {
        var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
        var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        const numStr = num.toString();
        let n: any = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        var str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
        str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
        return str.toUpperCase();
    }
}

new MockInvoiceService().generateTestInvoice().then(() => console.log('Done')).catch(console.error).finally(() => prisma.$disconnect());
