import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);
    private readonly apiUrl = 'https://www.smsgatewayhub.com/api/mt/SendSMS';

    async sendOtp(mobile: string, otp: string) {
        const apiKey = process.env.SMS_API_KEY;
        const senderId = process.env.SMS_SENDER_ID;

        if (!apiKey || !senderId) {
            this.logger.warn('SMS Credentials missing in .env');
            // Fallback for development if keys missing
            this.logger.log(`[SIMULATION] OTP for ${mobile}: ${otp}`);
            return true;
        }

        try {
            // SMSGatewayHub Parameters
            const params = new URLSearchParams();
            params.append('APIKey', apiKey);
            params.append('senderid', senderId);
            params.append('channel', '2'); // 2 = Transactional
            params.append('DCS', '0');
            params.append('flashsms', '0');
            params.append('number', mobile);
            params.append('text', `Your OTP for Spark Blue Diamond is ${otp}. Valid for 10 minutes.`);
            params.append('route', '1'); // Check specific route ID for transactional

            const response = await axios.post(this.apiUrl, params);

            this.logger.log(`SMS Sent: ${JSON.stringify(response.data)}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to send SMS: ${error.message}`);
            throw error;
        }
    }
}
