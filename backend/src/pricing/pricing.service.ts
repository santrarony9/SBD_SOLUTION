import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyOn } from '@prisma/client';

@Injectable()
export class PricingService {
    constructor(private prisma: PrismaService) { }

    async calculateProductPrice(product: any) {
        try {
            // 1. Fetch Rates
            const goldRate = await this.prisma.goldPrice.findUnique({ where: { purity: product.goldPurity } });
            const diamondRate = await this.prisma.diamondPrice.findUnique({ where: { clarity: product.diamondClarity } });
            const charges = await this.prisma.charge.findMany({ where: { isActive: true } }) || [];

            // Defaults if rates missing
            const goldPricePer10g = goldRate?.pricePer10g || 0;
            const diamondPricePerCarat = diamondRate?.pricePerCarat || 0;

            // 2. Calculate Components
            const goldValue = (goldPricePer10g / 10) * product.goldWeight;
            const diamondValue = diamondPricePerCarat * product.diamondCarat;

            // 3. Calculate Charges
            const subTotal = goldValue + diamondValue;
            let makingCharges = 0;
            let otherCharges = 0;

            for (const charge of charges) {
                if (charge.name.toUpperCase().includes('GST')) continue;

                let chargeAmount = 0;

                if (charge.type === 'PER_GRAM' && charge.applyOn === ApplyOn.GOLD_VALUE) {
                    chargeAmount = charge.amount * product.goldWeight;
                } else if (charge.type === 'PER_CARAT' && charge.applyOn === ApplyOn.DIAMOND_VALUE) {
                    chargeAmount = charge.amount * product.diamondCarat;
                } else if (charge.type === 'FLAT') {
                    chargeAmount = charge.amount;
                } else if (charge.type === 'PERCENTAGE') {
                    if (charge.applyOn === ApplyOn.GOLD_VALUE) chargeAmount = (goldValue * charge.amount) / 100;
                    else if (charge.applyOn === ApplyOn.DIAMOND_VALUE) chargeAmount = (diamondValue * charge.amount) / 100;
                    else if (charge.applyOn === ApplyOn.SUBTOTAL) chargeAmount = (subTotal * charge.amount) / 100;
                }

                if (charge.name.toLowerCase().includes('making')) {
                    makingCharges += chargeAmount;
                } else {
                    otherCharges += chargeAmount;
                }
            }

            let gst = 0;
            const taxableAmount = subTotal + makingCharges + otherCharges;

            // GST
            const gstCharge = charges.find(c => c.name.toUpperCase().includes('GST'));
            if (gstCharge && gstCharge.type === 'PERCENTAGE') {
                gst = (taxableAmount * gstCharge.amount) / 100;
            }

            const finalPrice = taxableAmount + gst;

            return {
                validAsOf: new Date(),
                goldRate: goldPricePer10g,
                diamondRate: diamondPricePerCarat,
                components: {
                    goldValue,
                    diamondValue,
                    makingCharges,
                    otherCharges,
                    gst
                },
                finalPrice
            };
        } catch (error) {
            console.error('Error calculating price:', error);
            return null;
        }
    }
}
