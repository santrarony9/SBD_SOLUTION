import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';
import axios from 'axios';
import * as QRCode from 'qrcode';

@Injectable()
export class InvoiceService {
    constructor(private prisma: PrismaService) { }

    async generateInvoice(orderId: string): Promise<Buffer> {
        const order = await this.fetchOrder(orderId);
        return this.generatePDF(doc => this.buildInvoice(doc, order), { size: 'A4' });
    }

    async generateCreditNote(orderId: string): Promise<Buffer> {
        const order = await this.fetchOrder(orderId);
        return this.generatePDF(doc => this.buildCreditNote(doc, order), { size: 'A4' });
    }

    async generateLabel(orderId: string): Promise<Buffer> {
        const order = await this.fetchOrder(orderId);
        return this.generatePDF(doc => this.buildLabel(doc, order), { size: [288, 432], margin: 20 });
    }

    async generateBulkPDF(orderIds: string[], type: 'invoice' | 'label' | 'credit-note'): Promise<Buffer> {
        const orders = await (this.prisma as any).order.findMany({
            where: { id: { in: orderIds } },
            include: {
                user: true,
                items: { include: { product: true } }
            }
        });

        const options = type === 'label' ? { size: [288, 432], margin: 20 } : { size: 'A4', margin: 50 };

        return this.generatePDF(async (doc) => {
            for (let i = 0; i < orders.length; i++) {
                if (i > 0) doc.addPage(options);
                if (type === 'invoice') {
                    await this.buildInvoice(doc, orders[i]);
                } else if (type === 'label') {
                    await this.buildLabel(doc, orders[i]);
                } else if (type === 'credit-note') {
                    await this.buildCreditNote(doc, orders[i]);
                }
            }
        }, options);
    }

    private async fetchOrder(orderId: string) {
        const order = await (this.prisma as any).order.findUnique({
            where: { id: orderId },
            include: { user: true, items: { include: { product: true } } }
        });
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    private generatePDF(builder: (doc: PDFKit.PDFDocument) => Promise<void> | void, options: any): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const doc = new PDFDocument(options);
            const chunks: any[] = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', err => reject(err));
            await builder(doc);
            doc.end();
        });
    }

    private async buildInvoice(doc: PDFKit.PDFDocument, order: any) {
        this.generateHeader(doc, "Tax Invoice");
        this.generateCustomerInfo(doc, order, "Invoice Details");
        await this.generateInvoiceTable(doc, order);
        this.generateFooter(doc, order);
    }

    private async buildCreditNote(doc: PDFKit.PDFDocument, order: any) {
        this.generateHeader(doc, "Tax Credit Note");
        this.generateCustomerInfo(doc, order, "Credit Note Details");
        await this.generateInvoiceTable(doc, order, true); // true for reversal view
        this.generateFooter(doc, order);
    }

    private async buildLabel(doc: PDFKit.PDFDocument, order: any) {
        const shipping = order.shippingAddress as any;

        // QR Code
        const qrData = await QRCode.toDataURL(order.id);
        doc.image(qrData, 200, 20, { width: 60 });

        doc.fillColor("#000")
            .fontSize(14).font('Helvetica-Bold').text("SPARK BLUE", 20, 20)
            .fontSize(8).font('Helvetica').text("LUXURY LOGISTICS", 20, 35);

        doc.moveTo(20, 90).lineTo(268, 90).stroke("#000");

        doc.fontSize(10).font('Helvetica-Bold').text("SHIP TO:", 20, 110);
        doc.fontSize(12).font('Helvetica').text(shipping.fullName, 20, 125);
        doc.fontSize(10)
            .text(shipping.street, 20, 145, { width: 240 })
            .text(`${shipping.city}, ${shipping.state}`, 20, 175)
            .text(`PIN: ${shipping.zip}`, 20, 190);

        doc.moveTo(20, 220).lineTo(268, 220).stroke("#000");

        doc.fontSize(10).font('Helvetica-Bold').text("ORDER DETAILS", 20, 240);
        doc.fontSize(9).font('Helvetica')
            .text(`ID: ${order.id.slice(-12).toUpperCase()}`, 20, 255)
            .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 270)
            .text(`Weight: ${order.items.reduce((acc, current) => acc + (current.product.realWeight || 0), 0)}g`, 20, 285);

        doc.fontSize(14).font('Helvetica-Bold').text("E-WAY BILL NOT REQ.", 20, 320, { align: 'center', width: 248 });

        doc.fontSize(8).font('Helvetica')
            .text("Handle with care. High value contents.", 20, 380, { align: 'center', width: 248 });
    }

    private generateHeader(doc: PDFKit.PDFDocument, title: string) {
        doc.fillColor("#001F3F")
            .fontSize(20)
            .font('Helvetica-Bold')
            .text("SPARK BLUE DIAMOND", 50, 45)
            .fontSize(10)
            .font('Helvetica')
            .text(title, 200, 50, { align: "right" })
            .moveDown();

        doc.fontSize(10)
            .text("GSTIN: 24AAAAA0000A1Z5", 50, 70)
            .text("PAN: AAAAA0000A", 50, 85)
            .text("Surat, Gujarat, India", 50, 100);

        doc.moveTo(50, 120).lineTo(550, 120).stroke("#EEEEEE");
    }

    private generateCustomerInfo(doc: PDFKit.PDFDocument, order: any, sectionTitle: string) {
        const shipping = order.shippingAddress as any;
        const billing = order.billingAddress as any || shipping;

        doc.fontSize(12).font('Helvetica-Bold').text(sectionTitle, 50, 140);
        doc.fontSize(10).font('Helvetica');

        if (sectionTitle === "Credit Note Details") {
            doc.text(`CN No: ${order.creditNoteNumber || 'PENDING'}`, 50, 160)
                .text(`Date: ${new Date(order.cancelledAt || Date.now()).toLocaleDateString()}`, 50, 175)
                .text(`Ref Invoice: ${order.invoiceNumber || order.id.slice(-8).toUpperCase()}`, 50, 190);
        } else {
            doc.text(`Invoice No: ${order.invoiceNumber || order.id.slice(-8).toUpperCase()}`, 50, 160)
                .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 175)
                .text(`Place of Supply: ${order.placeOfSupply || shipping.state}`, 50, 190);
        }

        if (order.customerGSTIN) {
            doc.fillColor("#D4AF37").font('Helvetica-Bold').text(`GSTIN (B2B): ${order.customerGSTIN}`, 50, 205).fillColor("#000");
        }

        // Addresses
        doc.fontSize(12).font('Helvetica-Bold').text("Billing Address", 50, 230);
        doc.fontSize(10).font('Helvetica')
            .text(billing.fullName, 50, 250)
            .text(billing.street, 50, 265)
            .text(`${billing.city}, ${billing.state} - ${billing.zip}`, 50, 280);

        doc.fontSize(12).font('Helvetica-Bold').text("Shipping Address", 300, 230);
        doc.fontSize(10).font('Helvetica')
            .text(shipping.fullName, 300, 250)
            .text(shipping.street, 300, 265)
            .text(`${shipping.city}, ${shipping.state} - ${shipping.zip}`, 300, 280);

        doc.moveTo(50, 310).lineTo(550, 310).stroke("#EEEEEE");
    }

    private async generateInvoiceTable(doc: PDFKit.PDFDocument, order: any, isReversal = false) {
        let i;
        const invoiceTableTop = 330;

        doc.font('Helvetica-Bold');
        this.generateTableRow(doc, invoiceTableTop, "Item", "HSN", "Qty", "Weight", "Rate", "Total");
        this.generateHr(doc, invoiceTableTop + 20);
        doc.font('Helvetica');

        let position = invoiceTableTop + 30;
        for (const item of order.items) {
            const product = item.product;

            // Draw thumbnail if exists
            if (product.images && product.images[0]) {
                try {
                    const response = await axios.get(product.images[0], { responseType: 'arraybuffer' });
                    doc.image(response.data, 50, position, { width: 30 });
                } catch (e) { /* skip image if fail */ }
            }

            this.generateTableRow(
                doc,
                position,
                product.name,
                product.hsnCode || "7113",
                item.quantity.toString(),
                `${product.realWeight || 0}g`,
                `₹${item.price.toLocaleString()}`,
                `₹${(item.price * item.quantity).toLocaleString()}`
            );

            this.generateHr(doc, position + 40);
            position += 50;
        }

        const prefix = isReversal ? "-" : "";
        const subtotalPosition = position + 20;
        this.generateTableRow(doc, subtotalPosition, "", "", "", "", "Subtotal", `${prefix}₹${order.totalAmount.toLocaleString()}`);

        const taxAmount = order.taxAmount || (order.totalAmount * 0.03);
        const totalWithTax = (order.totalAmount + taxAmount);

        const cgst = order.cgstAmount || (taxAmount / 2);
        const sgst = order.sgstAmount || (taxAmount / 2);
        const igst = order.igstAmount || 0;

        if (igst > 0) {
            this.generateTableRow(doc, subtotalPosition + 20, "", "", "", "", "IGST", `${prefix}₹${igst.toFixed(2)}`);
        } else {
            this.generateTableRow(doc, subtotalPosition + 20, "", "", "", "", "CGST", `${prefix}₹${cgst.toFixed(2)}`);
            this.generateTableRow(doc, subtotalPosition + 40, "", "", "", "", "SGST", `${prefix}₹${sgst.toFixed(2)}`);
        }

        doc.font('Helvetica-Bold');
        const finalRowPos = igst > 0 ? subtotalPosition + 40 : subtotalPosition + 60;
        this.generateTableRow(doc, finalRowPos, "", "", "", "", isReversal ? "Total Refund" : "Grand Total", `${prefix}₹${totalWithTax.toLocaleString()}`);
    }

    private generateFooter(doc: PDFKit.PDFDocument, order: any) {
        // Amount in words logic placeholder
        const amountWords = "RUPEES " + this.numberToWords(Math.round(order.totalAmount * 1.03)) + " ONLY";

        doc.fontSize(10).font('Helvetica-Bold').text("Amount in Words:", 50, doc.y + 40);
        doc.fontSize(10).font('Helvetica').text(amountWords, 50, doc.y + 10);

        doc.fontSize(10).font('Helvetica-Bold').text("Declaration:", 50, doc.y + 30);
        doc.fontSize(8).font('Helvetica').text("We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.", 50, doc.y + 10);

        doc.fontSize(10).text("Authorized Signatory", 400, doc.y + 50, { align: "right" });
        doc.text("For Spark Blue Diamond", 400, doc.y + 5, { align: "right" });
    }

    private generateTableRow(doc: PDFKit.PDFDocument, y: number, item: string, hsn: string, qty: string, weight: string, rate: string, total: string) {
        doc.fontSize(10)
            .text(item, 90, y, { width: 150 }) // Offset for image
            .text(hsn, 250, y)
            .text(qty, 300, y)
            .text(weight, 340, y)
            .text(rate, 400, y, { width: 70, align: "right" })
            .text(total, 480, y, { width: 70, align: "right" });
    }

    private generateHr(doc: PDFKit.PDFDocument, y: number) {
        doc.strokeColor("#eeeeee").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
    }

    private numberToWords(num: number): string {
        var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
        var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        const numStr = num.toString();
        if (numStr.length > 9) return 'overflow';
        let n: any = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return '';
        var str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
        str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
        return str.toUpperCase();
    }
}
