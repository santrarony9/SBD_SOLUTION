import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class StoreService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService
    ) { }

    async upsertSetting(key: string, value: any) {
        // Value is stored as JSON string
        const stringValue = JSON.stringify(value);

        const setting = await this.prisma.storeSetting.upsert({
            where: { key },
            update: { value: stringValue },
            create: { key, value: stringValue }
        });

        await this.redis.del(`setting:${key}`);
        return setting;
    }

    async getSetting(key: string) {
        const cacheKey = `setting:${key}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const setting = await this.prisma.storeSetting.findUnique({
            where: { key }
        });

        if (!setting) return null;

        try {
            // Return parsed JSON
            const result = {
                ...setting,
                value: JSON.parse(setting.value)
            };
            await this.redis.set(cacheKey, JSON.stringify(result), 3600); // 1 hour cache
            return result;
        } catch (e) {
            return setting;
        }
    }

    async getAllSettings() {
        const settings = await this.prisma.storeSetting.findMany();
        return settings.map(s => {
            try {
                return { ...s, value: JSON.parse(s.value) };
            } catch (e) {
                return s;
            }
        });
    }
}
