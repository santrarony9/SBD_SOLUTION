import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: any): Promise<{
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
    findOne(id: string): Promise<any>;
}
