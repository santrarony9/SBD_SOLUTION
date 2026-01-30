"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProduct(data) {
        return this.prisma.product.create({ data });
    }
    async findAll() {
        const products = await this.prisma.product.findMany({ where: { isActive: true } });
        return Promise.all(products.map(p => this.enrichWithPrice(p)));
    }
    async findOne(slugOrId) {
        const product = await this.prisma.product.findFirst({
            where: {
                OR: [{ id: slugOrId }, { slug: slugOrId }],
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return this.enrichWithPrice(product);
    }
    async enrichWithPrice(product) {
        const goldRate = await this.prisma.goldPrice.findUnique({ where: { purity: product.goldPurity } });
        const diamondRate = await this.prisma.diamondPrice.findUnique({ where: { clarity: product.diamondClarity } });
        const charges = await this.prisma.charge.findMany({ where: { isActive: true } });
        const goldPricePer10g = goldRate?.pricePer10g || 0;
        const diamondPricePerCarat = diamondRate?.pricePerCarat || 0;
        const goldValue = (goldPricePer10g / 10) * product.goldWeight;
        const diamondValue = diamondPricePerCarat * product.diamondCarat;
        let makingCharges = 0;
        let otherCharges = 0;
        let gst = 0;
        for (const charge of charges) {
            if (charge.name.toUpperCase().includes('GST'))
                continue;
            let chargeAmount = 0;
            if (charge.type === 'PER_GRAM' && charge.applyOn === client_1.ApplyOn.GOLD_VALUE) {
                chargeAmount = charge.amount * product.goldWeight;
            }
            else if (charge.type === 'PER_CARAT' && charge.applyOn === client_1.ApplyOn.DIAMOND_VALUE) {
                chargeAmount = charge.amount * product.diamondCarat;
            }
            else if (charge.type === 'FLAT') {
                chargeAmount = charge.amount;
            }
            else if (charge.type === 'PERCENTAGE') {
                if (charge.applyOn === client_1.ApplyOn.GOLD_VALUE)
                    chargeAmount = (goldValue * charge.amount) / 100;
                if (charge.applyOn === client_1.ApplyOn.DIAMOND_VALUE)
                    chargeAmount = (diamondValue * charge.amount) / 100;
            }
            if (charge.name.toLowerCase().includes('making')) {
                makingCharges += chargeAmount;
            }
            else {
                otherCharges += chargeAmount;
            }
        }
        const subTotal = goldValue + diamondValue;
        const taxableAmount = subTotal + makingCharges + otherCharges;
        const gstCharge = charges.find(c => c.name.toUpperCase().includes('GST'));
        if (gstCharge) {
            if (gstCharge.type === 'PERCENTAGE') {
                gst = (taxableAmount * gstCharge.amount) / 100;
            }
        }
        const finalPrice = taxableAmount + gst;
        return {
            ...product,
            pricing: {
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
            }
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map