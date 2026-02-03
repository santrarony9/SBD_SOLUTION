import { Controller, Get, Post, Body, Param, Res, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('invoice')
export class InvoiceController {
    constructor(private invoiceService: InvoiceService) { }

    @Get(':orderId')
    @UseGuards(JwtAuthGuard)
    async getInvoice(@Param('orderId') orderId: string, @Res() res: Response) {
        const buffer = await this.invoiceService.generateInvoice(orderId);
        this.sendPDF(res, buffer, `Invoice-${orderId}.pdf`);
    }

    @Get('label/:orderId')
    @UseGuards(JwtAuthGuard)
    async getLabel(@Param('orderId') orderId: string, @Res() res: Response) {
        const buffer = await this.invoiceService.generateLabel(orderId);
        this.sendPDF(res, buffer, `Label-${orderId}.pdf`);
    }

    @Get('credit-note/:orderId')
    @UseGuards(JwtAuthGuard)
    async getCreditNote(@Param('orderId') orderId: string, @Res() res: Response) {
        const buffer = await this.invoiceService.generateCreditNote(orderId);
        this.sendPDF(res, buffer, `CreditNote-${orderId}.pdf`);
    }

    @Post('bulk')
    @UseGuards(JwtAuthGuard)
    async bulkPrint(@Body() body: { orderIds: string[], type: 'invoice' | 'label' }, @Res() res: Response) {
        const buffer = await this.invoiceService.generateBulkPDF(body.orderIds, body.type);
        this.sendPDF(res, buffer, `Bulk-${body.type}s.pdf`);
    }

    @Post('send/:orderId')
    @UseGuards(JwtAuthGuard)
    async sendInvoice(@Param('orderId') orderId: string) {
        const result = await this.invoiceService.sendInvoiceViaWhatsapp(orderId);
        return { success: true, message: 'Invoice Sent via WhatsApp', result };
    }

    private sendPDF(res: Response, buffer: Buffer, filename: string) {
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=${filename}`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
