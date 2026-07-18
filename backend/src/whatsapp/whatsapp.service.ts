import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  private readonly user = process.env.WHATSAPP_API_USER;
  private readonly pass = process.env.WHATSAPP_API_PASS;
  private readonly sender = process.env.WHATSAPP_API_SENDER;
  private readonly apiUrl =
    process.env.WHATSAPP_API_URL || 'http://bhashsms.com/api/sendmsg.php';
  private readonly adminNumbers = process.env.WHATSAPP_ADMIN_NUMBERS || '';

  private genAI: GoogleGenerativeAI;

  constructor() {
    const genKey = process.env.GEMINI_API_KEY;
    if (genKey) {
      this.genAI = new GoogleGenerativeAI(genKey);
    }
  }

  /**
   * Core sending function for Bhash SMS
   */
  private async sendBhashSms(phone: string, text: string, params: any = {}) {
    try {
      // Ensure phone is clean (no +91, Bhash prefers 10 digits or specific format)
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);

      const queryParams = new URLSearchParams({
        user: this.user,
        pass: this.pass,
        sender: this.sender,
        phone: cleanPhone,
        text: text,
        priority: 'wa',
        stype: 'normal',
        ...params,
      });

      const url = `${this.apiUrl}?${queryParams.toString()}`;
      this.logger.log(`Sending WhatsApp to ${cleanPhone}...`);

      const response = await axios.get(url);

      if (response.data && response.data.includes('S.ID')) {
        this.logger.log(`WhatsApp sent successfully: ${response.data}`);
        return { success: true, response: response.data };
      } else {
        this.logger.error(`WhatsApp failed: ${response.data}`);
        return { success: false, response: response.data };
      }
    } catch (error) {
      this.logger.error(`WhatsApp API Error: ${(error as any).message}`);
      return { success: false, error: (error as any).message };
    }
  }

  // ------------------------------------------
  // AI Message Generator (Private Helper)
  // ------------------------------------------
  private async generateMessage(
    prompt: string,
    fallback: string,
  ): Promise<string> {
    if (!this.genAI) return fallback;
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
      }); // Updated to a more standard model name if needed
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      this.logger.error('AI Message Generation Failed', e);
      return fallback;
    }
  }

  // ------------------------------------------
  // Customer Notifications
  // ------------------------------------------

  async sendOtp(phone: string, otp: string) {
    // According to docs: stype=auth for OTP
    return this.sendBhashSms(phone, 'OTP_TEMPLATE', {
      stype: 'auth',
      Params: otp,
    });
  }

  async sendOrderConfirmation(phone: string, orderId: string, amount: number) {
    const text = `ORDER_CONFIRMATION_TEMPLATE`;
    const params = `${orderId},${amount}`;
    return this.sendBhashSms(phone, text, { Params: params });
  }

  async sendInvoice(
    phone: string,
    invoiceUrl: string,
    customerName: string = 'Customer',
    orderId: string = '',
  ) {
    // According to docs for Image/Video: htype=image&url=...
    return this.sendBhashSms(phone, 'INVOICE_TEMPLATE', {
      Params: `${customerName},${orderId}`,
      htype: 'image',
      url: invoiceUrl,
    });
  }

  async sendDispatchAlert(phone: string, trackingUrl: string) {
    return this.sendBhashSms(phone, 'DISPATCH_ALERT_TEMPLATE', {
      Params: trackingUrl,
    });
  }

  async sendDeliveryOtp(phone: string, otp: string) {
    return this.sendBhashSms(phone, 'DELIVERY_OTP_TEMPLATE', {
      stype: 'auth',
      Params: otp,
    });
  }

  async sendWelcomeMessage(phone: string, name: string) {
    const fallback = `Welcome to Spark Blue Diamond, ${name}. We are delighted to have you with us.`;
    const prompt = `Write a short, elegant, and warm welcome message for a new member named "${name}" joining "Spark Blue Diamond". Keep it under 20 words.`;

    const message = await this.generateMessage(prompt, fallback);
    return this.sendBhashSms(phone, message);
  }

  async sendThankYou(phone: string, customerName: string, productName: string) {
    const fallback = `Dear ${customerName}, thank you for purchasing ${productName}.`;
    const prompt = `Write a short, luxurious thank you note for "${customerName}" for buying "${productName}".`;

    const message = await this.generateMessage(prompt, fallback);
    return this.sendBhashSms(phone, message);
  }

  // ------------------------------------------
  // Admin Alerts (Role Based)
  // ------------------------------------------

  async sendAdminNewOrderAlert(orderId: string, amount: number) {
    const message = `Admin Alert: New Order #${orderId} received. Value: ₹${amount}`;
    const admins = this.adminNumbers.split(',');
    for (const admin of admins) {
      if (admin) await this.sendBhashSms(admin, message);
    }
    return true;
  }

  async sendAdminStockAlert(productName: string, stock: number) {
    const message = `Admin Alert: Low Stock! ${productName} has only ${stock} left.`;
    const admins = this.adminNumbers.split(',');
    for (const admin of admins) {
      if (admin) await this.sendBhashSms(admin, message);
    }
    return true;
  }

  // ------------------------------------------
  // Added Methods for Backward Compilation Compatibility
  // ------------------------------------------

  async sendAbandonedCartReminder(
    phone: string,
    customerName: string,
    imageUrl: string,
    productNames: string,
    discountCode: string,
  ) {
    const text = `ABANDONED_CART_TEMPLATE`;
    const params = `${customerName},${productNames},${discountCode}`;

    return this.sendBhashSms(phone, text, {
      Params: params,
      htype: 'image',
      url: imageUrl,
    });
  }

  async sendTemplateMessage(
    phone: string,
    templateId: string,
    parameters?: any[],
  ) {
    this.logger.log(
      `[Stub] Sending WhatsApp template ${templateId} to ${phone}`,
    );
    return { success: true, message: 'Stub method executed' };
  }

  async sendAdminReturnAlert(orderId: string, details: string) {
    const message = `Admin Alert: Return requested for Order #${orderId}. ${details}`;
    const admins = this.adminNumbers.split(',');
    for (const admin of admins) {
      if (admin) await this.sendBhashSms(admin, message);
    }
    return true;
  }

  async sendAdminExchangeAlert(orderId: string, details: string) {
    const message = `Admin Alert: Exchange requested for Order #${orderId}. ${details}`;
    const admins = this.adminNumbers.split(',');
    for (const admin of admins) {
      if (admin) await this.sendBhashSms(admin, message);
    }
    return true;
  }
}
