import { Controller, Get, Post, Body, Header, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

import { LogBufferService } from './log-buffer.service';
import { TrafficService } from './traffic.service';

@Controller('diagnostics')
export class DiagnosticsController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logBuffer: LogBufferService,
        private readonly traffic: TrafficService,
    ) { }

    @Get('traffic')
    getTraffic() {
        return this.traffic.getMetrics();
    }

    @Get('ping')
    ping() {
        return { status: 'ok', message: 'pong', timestamp: new Date().toISOString() };
    }

    @Get('logs')
    async getLogs() {
        return {
            logs: this.logBuffer.getLogs(),
            timestamp: new Date().toISOString()
        };
    }

    @Get()
    async checkHealth() {
        try {
            // 1. Check DB Connection & User Count
            const userCount = await this.prisma.user.count();

            // 2. Check for Admin
            const adminUser = await this.prisma.user.findFirst({
                where: { email: { equals: 'admin@sparkblue.com', mode: 'insensitive' } },
                select: { id: true, email: true, role: true, createdAt: true }
            });

            // 3. Reveal partial env (Safe exposure)
            const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
            const maskedDbUrl = dbUrl.replace(/:[^:]*@/, ':****@');

            return {
                status: 'OK',
                database: {
                    connected: true,
                    userCount,
                    url_config: maskedDbUrl,
                },
                admin_check: {
                    exists: !!adminUser,
                    details: adminUser || 'NOT_FOUND',
                },
                timestamp: new Date().toISOString(),
            };
        } catch (error: any) {
            return {
                status: 'ERROR',
                message: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }

    @Post('reset-admin')
    async resetAdmin() {
        try {
            const email = 'admin@sparkblue.com';
            const password = 'Admin@123';
            const hashedPassword = await bcrypt.hash(password, 10);

            await this.prisma.user.upsert({
                where: { email },
                update: {
                    password: hashedPassword,
                    role: 'SUPER_ADMIN' as any,
                    name: 'Super Admin',
                },
                create: {
                    email,
                    password: hashedPassword,
                    name: 'Super Admin',
                    role: 'SUPER_ADMIN' as any,
                },
            });

            return { status: 'SUCCESS', message: 'Admin account reset to Admin@123' };
        } catch (error: any) {
            return { status: 'ERROR', message: error.message };
        }
    }
}
