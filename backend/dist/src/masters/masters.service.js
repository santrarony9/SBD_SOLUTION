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
exports.MastersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MastersService = class MastersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getGoldPrices() {
        return this.prisma.goldPrice.findMany({ orderBy: { purity: 'asc' } });
    }
    async updateGoldPrice(purity, pricePer10g) {
        return this.prisma.goldPrice.update({
            where: { purity },
            data: { pricePer10g },
        });
    }
    async getDiamondPrices() {
        return this.prisma.diamondPrice.findMany({ orderBy: { pricePerCarat: 'desc' } });
    }
    async updateDiamondPrice(clarity, pricePerCarat) {
        return this.prisma.diamondPrice.update({
            where: { clarity },
            data: { pricePerCarat },
        });
    }
    async getCharges() {
        return this.prisma.charge.findMany();
    }
    async updateCharge(id, data) {
        return this.prisma.charge.update({
            where: { id },
            data,
        });
    }
};
exports.MastersService = MastersService;
exports.MastersService = MastersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MastersService);
//# sourceMappingURL=masters.service.js.map