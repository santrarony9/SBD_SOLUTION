"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding data...');
    const adminEmail = 'admin@sparkblue.com';
    const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: 'Super Admin',
                role: client_1.Role.ADMIN,
            },
        });
        console.log('Admin user created');
    }
    const goldPurities = [18, 22, 24];
    for (const purity of goldPurities) {
        await prisma.goldPrice.upsert({
            where: { purity },
            update: {},
            create: {
                purity,
                pricePer10g: 65000 + (purity - 18) * 1000,
            },
        });
    }
    console.log('Gold prices seeded');
    const clarities = ['VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2'];
    let price = 50000;
    for (const clarity of clarities) {
        await prisma.diamondPrice.upsert({
            where: { clarity },
            update: {},
            create: {
                clarity,
                pricePerCarat: price,
            },
        });
        price -= 3000;
    }
    console.log('Diamond prices seeded');
    await prisma.charge.createMany({
        skipDuplicates: true,
        data: [
            {
                name: 'Making Charges',
                type: client_1.ChargeType.PER_GRAM,
                amount: 800,
                applyOn: client_1.ApplyOn.GOLD_VALUE,
            },
            {
                name: 'GST',
                type: client_1.ChargeType.PERCENTAGE,
                amount: 3,
                applyOn: client_1.ApplyOn.FINAL_AMOUNT,
            }
        ],
    });
    console.log('Charges seeded');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map