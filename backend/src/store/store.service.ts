import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoreService {
    constructor(private prisma: PrismaService) { }

    async upsertSetting(key: string, value: any) {
        // Value is stored as JSON string
        const stringValue = JSON.stringify(value);

        return this.prisma.storeSetting.upsert({
            where: { key },
            update: { value: stringValue },
            create: { key, value: stringValue }
        });
    }

    async getSetting(key: string) {
        const setting = await this.prisma.storeSetting.findUnique({
            where: { key }
        });

        if (!setting) return null;

        try {
            // Return parsed JSON
            return {
                ...setting,
                value: JSON.parse(setting.value)
            };
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
