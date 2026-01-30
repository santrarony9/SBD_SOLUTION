import { MastersService } from './masters.service';
export declare class MastersController {
    private readonly mastersService;
    constructor(mastersService: MastersService);
    getGoldPrices(): Promise<{
        id: string;
        updatedAt: Date;
        purity: number;
        pricePer10g: number;
        isActive: boolean;
    }[]>;
    updateGoldPrice(purity: string, price: number): Promise<{
        id: string;
        updatedAt: Date;
        purity: number;
        pricePer10g: number;
        isActive: boolean;
    }>;
    getDiamondPrices(): Promise<{
        id: string;
        updatedAt: Date;
        isActive: boolean;
        clarity: string;
        pricePerCarat: number;
    }[]>;
    updateDiamondPrice(clarity: string, price: number): Promise<{
        id: string;
        updatedAt: Date;
        isActive: boolean;
        clarity: string;
        pricePerCarat: number;
    }>;
    getCharges(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: import(".prisma/client").$Enums.ChargeType;
        amount: number;
        applyOn: import(".prisma/client").$Enums.ApplyOn;
    }[]>;
    updateCharge(id: string, data: {
        amount?: number;
        isActive?: boolean;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: import(".prisma/client").$Enums.ChargeType;
        amount: number;
        applyOn: import(".prisma/client").$Enums.ApplyOn;
    }>;
}
