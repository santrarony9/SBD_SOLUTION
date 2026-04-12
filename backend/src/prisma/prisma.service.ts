import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Connected to MongoDB successfully!');
    } catch (error) {
      console.error(
        '❌ MongoDB Connection Failed (Logged but not fatal):',
        error,
      );
      // DO NOT THROW. Allow app to start so we can diagnose via /api/diagnostics
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
