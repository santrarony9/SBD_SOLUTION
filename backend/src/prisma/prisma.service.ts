import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            datasources: {
                db: {
                    url: (process.env.DATABASE_URL || '').trim(),
                },
            },
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            console.log('✅ Connected to MongoDB successfully!');
        } catch (error) {
            console.error('❌ MongoDB Connection Failed:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
