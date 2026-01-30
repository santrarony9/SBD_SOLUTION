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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MastersController = void 0;
const common_1 = require("@nestjs/common");
const masters_service_1 = require("./masters.service");
let MastersController = class MastersController {
    mastersService;
    constructor(mastersService) {
        this.mastersService = mastersService;
    }
    getGoldPrices() {
        return this.mastersService.getGoldPrices();
    }
    updateGoldPrice(purity, price) {
        return this.mastersService.updateGoldPrice(Number(purity), price);
    }
    getDiamondPrices() {
        return this.mastersService.getDiamondPrices();
    }
    updateDiamondPrice(clarity, price) {
        return this.mastersService.updateDiamondPrice(clarity, price);
    }
    getCharges() {
        return this.mastersService.getCharges();
    }
    updateCharge(id, data) {
        return this.mastersService.updateCharge(id, data);
    }
};
exports.MastersController = MastersController;
__decorate([
    (0, common_1.Get)('gold'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "getGoldPrices", null);
__decorate([
    (0, common_1.Put)('gold/:purity'),
    __param(0, (0, common_1.Param)('purity')),
    __param(1, (0, common_1.Body)('price')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "updateGoldPrice", null);
__decorate([
    (0, common_1.Get)('diamond'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "getDiamondPrices", null);
__decorate([
    (0, common_1.Put)('diamond/:clarity'),
    __param(0, (0, common_1.Param)('clarity')),
    __param(1, (0, common_1.Body)('price')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "updateDiamondPrice", null);
__decorate([
    (0, common_1.Get)('charges'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "getCharges", null);
__decorate([
    (0, common_1.Put)('charges/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "updateCharge", null);
exports.MastersController = MastersController = __decorate([
    (0, common_1.Controller)('masters'),
    __metadata("design:paramtypes", [masters_service_1.MastersService])
], MastersController);
//# sourceMappingURL=masters.controller.js.map