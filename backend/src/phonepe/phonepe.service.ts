
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { lastValueFrom } from 'rxjs';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PhonePeService {
    private readonly logger = new Logger(PhonePeService.name);

    // Test Credentials by default
    private merchantId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
    private saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    private saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    private hostUrl = process.env.PHONEPE_HOST_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    private callbackUrl = process.env.PHONEPE_CALLBACK_URL || 'https://api.sparkbluediamond.com/api/phonepe/callback';
    private redirectBaseUrl = process.env.FRONTEND_URL || 'https://www.sparkbluediamond.com';

    constructor(
        private httpService: HttpService,
        private ordersService: OrdersService
    ) { }

    async initiatePayment(orderId: string, amount: number, mobile: string, userId: string = 'GUEST') {
        try {
            const merchantTransactionId = `MT${Date.now()}_${orderId.slice(-6)}`;

            // Amount in paise (1 INR = 100 paise)
            const amountInPaise = Math.round(amount * 100);

            const payload = {
                merchantId: this.merchantId,
                merchantTransactionId: merchantTransactionId,
                merchantUserId: userId,
                amount: amountInPaise,
                redirectUrl: `${this.callbackUrl}?id=${merchantTransactionId}`, // We handle redirect via callback or separate route
                redirectMode: "POST", // PhonePe will POST to this URL
                callbackUrl: this.callbackUrl,
                mobileNumber: mobile,
                paymentInstrument: {
                    type: "PAY_PAGE"
                }
            };

            const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

            // Checksum logic: SHA256(base64Payload + "/pg/v1/pay" + saltKey) + ### + saltIndex
            const stringToHash = base64Payload + '/pg/v1/pay' + this.saltKey;
            const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
            const checksum = `${sha256}###${this.saltIndex}`;

            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                }
            };

            const url = `${this.hostUrl}/pg/v1/pay`;

            const response = await lastValueFrom(
                this.httpService.post(url, { request: base64Payload }, options)
            );

            const data = response.data;

            if (data.success) {
                // Save the merchantTransactionId to the order for later verification
                await this.ordersService.updatePhonePeDetails(orderId, merchantTransactionId);

                return {
                    url: data.data.instrumentResponse.redirectInfo.url,
                    merchantTransactionId
                };
            } else {
                throw new BadRequestException('PhonePe Initiation Failed: ' + data.message);
            }

        } catch (error) {
            this.logger.error(`PhonePe Init Error: ${error.message}`, error.stack);
            throw new BadRequestException('Payment initiation failed');
        }
    }

    async verifyPayment(merchantTransactionId: string) {
        try {
            // Checksum: SHA256("/pg/v1/status/{merchantId}/{merchantTransactionId}" + saltKey) + ### + saltIndex
            const stringToHash = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}` + this.saltKey;
            const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
            const checksum = `${sha256}###${this.saltIndex}`;

            const url = `${this.hostUrl}/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;

            const response = await lastValueFrom(
                this.httpService.get(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-VERIFY': checksum,
                        'X-MERCHANT-ID': this.merchantId
                    }
                })
            );

            const data = response.data;

            if (data.success && data.code === 'PAYMENT_SUCCESS') {
                return { success: true, data: data.data };
            } else {
                return { success: false, status: data.code };
            }

        } catch (error) {
            this.logger.error(`Verification Failed: ${error.message}`);
            return { success: false };
        }
    }
}
