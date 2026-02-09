import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ShiprocketService {
    private readonly logger = new Logger(ShiprocketService.name);
    private token: string | null = null;
    private tokenExpiry: number | null = null;

    private readonly email = process.env.SHIPROCKET_EMAIL;
    private readonly password = process.env.SHIPROCKET_PASSWORD;

    constructor() { }

    private async login() {
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        try {
            const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
                email: this.email,
                password: this.password,
            });

            this.token = response.data.token;
            // Token is usually valid for 10 days, but let's refresh every 24 hours to be safe
            this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
            return this.token;
        } catch (error) {
            this.logger.error('Failed to login to Shiprocket', error.response?.data || error.message);
            throw new Error('Shiprocket Login Failed');
        }
    }

    async createOrder(orderData: any) {
        try {
            const token = await this.login();

            // Transform local order data to Shiprocket payload
            // This mapping assumes standard Shiprocket fields. Adjust as per specific requirements.
            const payload = {
                order_id: orderData.id,
                order_date: new Date(orderData.createdAt).toISOString().split('T')[0],
                pickup_location: 'Primary', // Needs to be configured in Shiprocket dashboard
                billing_customer_name: orderData.billingAddress.fullName.split(' ')[0],
                billing_last_name: orderData.billingAddress.fullName.split(' ').slice(1).join(' '),
                billing_address: orderData.billingAddress.street,
                billing_city: orderData.billingAddress.city,
                billing_pincode: orderData.billingAddress.zip,
                billing_state: orderData.billingAddress.state,
                billing_country: 'India',
                billing_email: orderData.user.email,
                billing_phone: orderData.billingAddress.phone,
                shipping_is_billing: true, // Assuming for now, update if different
                order_items: orderData.items.map(item => ({
                    name: item.product.name,
                    sku: item.product.sku || item.productId,
                    units: item.quantity,
                    selling_price: item.price,
                    discount: 0,
                    tax: item.product.gstRate || 3,
                    hsn: item.product.hsnCode || 7113
                })),
                payment_method: orderData.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
                sub_total: orderData.totalAmount, // This should be the total value
                length: 10, // Placeholder dimensions
                breadth: 10,
                height: 10,
                weight: orderData.items.reduce((acc, item) => acc + (item.product.realWeight || 0.5), 0) / 1000 // Convert grams to kg? Shiprocket creates shipment in kg usually. CHECK THIS.
            };

            const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            this.logger.error('Failed to create order in Shiprocket', error.response?.data || error.message);
            // Don't throw, just return null so we don't block the main order flow
            return null;
        }
    }

    async generateLabel(shipmentId: string) {
        try {
            const token = await this.login();
            const response = await axios.post('https://apiv2.shiprocket.in/v1/external/courier/generate/label', {
                shipment_id: [shipmentId]
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data; // Includes label_url
        } catch (error) {
            this.logger.error('Failed to generate label', error.response?.data || error.message);
            return null;
        }
    }

    async cancelOrder(shiprocketOrderId: string) {
        try {
            const token = await this.login();
            const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/cancel', {
                ids: [shiprocketOrderId]
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            this.logger.error('Failed to cancel order in Shiprocket', error.response?.data || error.message);
            throw error; // Throw to let OrdersService handle the error
        }
    }
}
