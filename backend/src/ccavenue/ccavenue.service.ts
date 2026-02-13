import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CcavenueService {
    private readonly logger = new Logger(CcavenueService.name);
    private readonly merchantId = process.env.CCAVENUE_MERCHANT_ID;
    private readonly accessCode = process.env.CCAVENUE_ACCESS_CODE;
    private readonly workingKey = process.env.CCAVENUE_WORKING_KEY;

    // CC Avenue specific encryption
    encrypt(plainText: string): string {
        const m = crypto.createHash('md5');
        m.update(this.workingKey);
        const key = m.digest();
        const iv = Buffer.from('\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f', 'binary');
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        let encoded = cipher.update(plainText, 'utf8', 'hex');
        encoded += cipher.final('hex');
        return encoded;
    }

    decrypt(encText: string): string {
        const m = crypto.createHash('md5');
        m.update(this.workingKey);
        const key = m.digest();
        const iv = Buffer.from('\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f', 'binary');
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decoded = decipher.update(encText, 'hex', 'utf8');
        decoded += decipher.final('utf8');
        return decoded;
    }

    getInitiateParams(orderId: string, amount: number, user: any) {
        // Construct the data string required by CC Avenue
        // Format: key1=value1&key2=value2...
        const redirectUrl = `${process.env.API_URL || 'https://api.sparkbluediamond.com'}/ccavenue/callback`;
        const cancelUrl = `${process.env.API_URL || 'https://api.sparkbluediamond.com'}/ccavenue/callback`;

        const data = `merchant_id=${this.merchantId}&order_id=${orderId}&currency=INR&amount=${amount}&redirect_url=${redirectUrl}&cancel_url=${cancelUrl}&language=EN&billing_name=${user.name}&billing_address=${user.address || ''}&billing_city=${user.city || ''}&billing_state=${user.state || ''}&billing_zip=${user.zip || ''}&billing_country=India&billing_tel=${user.phone}&billing_email=${user.email}`;

        return {
            encRequest: this.encrypt(data),
            access_code: this.accessCode
        };
    }
}
