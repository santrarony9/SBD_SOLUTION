import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ShiprocketService {
    private readonly logger = new Logger(ShiprocketService.name);
    private token: string | null = null;
    private tokenExpiry: Date | null = null;

    private readonly email = process.env.SHIPROCKET_EMAIL;
    private readonly password = process.env.SHIPROCKET_PASSWORD;

    constructor() { }

    private async login() {
        if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.token;
        }

        try {
            const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
                email: this.email,
                password: this.password,
            });

            this.token = response.data.token;
            // Token is usually valid for 10 days, but we'll refresh sooner to be safe (e.g., 9 days)
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 9);
            this.tokenExpiry = expiry;

            this.logger.log('Shiprocket Login Successful');
            return this.token;
        } catch (error) {
            this.logger.error('Shiprocket Login Failed', error.response?.data || error.message);
            throw new Error('Shiprocket Authentication Failed');
        }
    }

    async createOrder(orderData: any) {
        const token = await this.login();

        // Map our Order to Shiprocket Order Schema
        const payload = {
            order_id: orderData.id,
            order_date: new Date(orderData.createdAt).toISOString().split('T')[0] + ' ' + new Date(orderData.createdAt).toTimeString().split(' ')[0],
            pickup_location: "Primary", // Default, user can change if needed
            billing_customer_name: orderData.user?.name || orderData.shippingAddress.fullName,
            billing_last_name: "",
            billing_address: orderData.shippingAddress.street,
            billing_address_2: "",
            billing_city: orderData.shippingAddress.city,
            billing_pincode: orderData.shippingAddress.zip,
            billing_state: orderData.shippingAddress.state,
            billing_country: "India",
            billing_email: orderData.user?.email || "guest@example.com",
            billing_phone: orderData.shippingAddress.phone,
            shipping_is_billing: true,
            order_items: orderData.items.map(item => ({
                name: item.product.name,
                sku: item.product.slug || item.productId,
                units: item.quantity,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: 7113 // Jewellery
            })),
            payment_method: "Prepaid",
            sub_total: orderData.totalAmount, // Assuming total includes tax for now
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5 // Default weight 500g, should come from product in future
        };

        try {
            const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            this.logger.log(`Shiprocket Order Created: ${response.data.order_id}`);
            return response.data;
        } catch (error) {
            this.logger.error('Shiprocket Create Order Failed', error.response?.data || error.message);
            // Don't throw, just return null so we don't break the main order flow
            return null;
        }
    }

    async cancelOrder(shiprocketOrderId: string) {
        const token = await this.login();
        try {
            await axios.post('https://apiv2.shiprocket.in/v1/external/orders/cancel', {
                ids: [shiprocketOrderId]
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return true;
        } catch (error) {
            this.logger.error('Shiprocket Cancel Failed', error.message);
            return false;
        }
    }

    async generateAWB(shipmentId: string) {
        const token = await this.login();
        try {
            const response = await axios.post('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
                shipment_id: shipmentId,
                // courier_id: optional, if not sent, Shiprocket auto-assigns best
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            this.logger.log(`Shiprocket AWB Generated: ${response.data.response.data.awb_code}`);
            return response.data.response.data; // contains awb_code, courier_company_id, etc.
        } catch (error) {
            this.logger.error('Shiprocket AWB Generation Failed', error.response?.data || error.message);
            throw new Error('Failed to generate AWB');
        }
    }

    async generateLabel(shipmentId: string) {
        const token = await this.login();
        try {
            const response = await axios.post('https://apiv2.shiprocket.in/v1/external/courier/generate/label', {
                shipment_id: [shipmentId]
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            this.logger.log(`Shiprocket Label Generated for ${shipmentId}`);
            return response.data; // contains label_url
        } catch (error) {
            this.logger.error('Shiprocket Label Generation Failed', error.response?.data || error.message);
            return null;
        }
    }

    getTrackingUrl(awbCode: string) {
        return `https://shiprocket.co/tracking/${awbCode}`;
    }

    async testAuth() {
        try {
            const token = await this.login();
            return { success: true, token: !!token };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
}
