import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    createProduct(data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
        description: string | null;
        goldPurity: number;
        goldWeight: number;
        diamondClarity: string;
        diamondCarat: number;
        diamondColor: string | null;
        diamondCut: string | null;
        igiCertificateNumber: string | null;
        certificatePdf: string | null;
        images: string[];
        video: string | null;
    }>;
    findAll(): Promise<any[]>;
    findOne(slugOrId: string): Promise<any>;
    private enrichWithPrice;
}
