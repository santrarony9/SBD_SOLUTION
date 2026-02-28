import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyOn } from '@prisma/client';

@Injectable()
export class PricingService {
    constructor(private prisma: PrismaService) { }

    async calculateProductPrice(product: any) {
        try {
            // 1. Fetch Rates & Tiered Settings
            const goldRate = await this.prisma.goldPrice.findUnique({ where: { purity: product.goldPurity } });
            const diamondRate = await this.prisma.diamondPrice.findUnique({ where: { clarity: product.diamondClarity } });
            const charges = await this.prisma.charge.findMany({ where: { isActive: true } }) || [];
            const makingChargeTierSetting = await this.prisma.storeSetting.findUnique({ where: { key: 'making_charge_tiers' } });

            // Defaults if rates missing
            const goldPricePer10g = goldRate?.pricePer10g || 0;
            const diamondPricePerCarat = diamondRate?.pricePerCarat || 0;

            // 2. Calculate Components
            const goldValue = (goldPricePer10g / 10) * product.goldWeight;
            const diamondValue = diamondPricePerCarat * product.diamondCarat;

            // 3. Calculate Other Charges first (Excluding standard making charge)
            const subTotal = goldValue + diamondValue;
            let otherCharges = 0;

            for (const charge of charges) {
                if (charge.name.toUpperCase().includes('GST') || charge.name.toLowerCase().includes('making')) continue; // Skip GST AND legacy making charge

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

                otherCharges += chargeAmount;
            }

            // 4. Calculate Tiered Making Charges
            let makingCharges = 0;
            if (makingChargeTierSetting) {
                try {
                    const tiers = JSON.parse(makingChargeTierSetting.value);
                    let activeTier = tiers.find(t => t.id === '3g_plus'); // Default to highest tier

                    const weight = product.goldWeight || 0;
                    if (weight >= 0 && weight < 1) activeTier = tiers.find(t => t.id === '0_1g');
                    else if (weight >= 1 && weight < 2) activeTier = tiers.find(t => t.id === '1_2g');
                    else if (weight >= 2 && weight < 3) activeTier = tiers.find(t => t.id === '2_3g');

                    if (activeTier) {
                        if (activeTier.type === 'FLAT') {
                            makingCharges = Number(activeTier.amount);
                        } else if (activeTier.type === 'PER_GRAM') {
                            makingCharges = Number(activeTier.amount) * weight;
                        } else if (activeTier.type === 'PERCENTAGE') {
                            makingCharges = (goldValue * Number(activeTier.amount)) / 100;
                        }
                    }
                } catch (e) {
                    console.error("Error parsing making charge tiers", e);
                }
            } else {
                // Fallback to legacy Making Charge if tiers aren't configured yet
                const legacyMakingCharge = charges.find(c => c.name.toLowerCase().includes('making'));
                if (legacyMakingCharge) {
                    if (legacyMakingCharge.type === 'FLAT') makingCharges = legacyMakingCharge.amount;
                    else if (legacyMakingCharge.type === 'PERCENTAGE') makingCharges = (goldValue * legacyMakingCharge.amount) / 100;
                    else if (legacyMakingCharge.type === 'PER_GRAM') makingCharges = legacyMakingCharge.amount * product.goldWeight;
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
