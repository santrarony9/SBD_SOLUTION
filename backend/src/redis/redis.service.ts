import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private redisClient: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const redisUrl = this.configService.get<string>('REDIS_URL');

        if (redisUrl) {
            this.redisClient = new Redis(redisUrl, {
                maxRetriesPerRequest: 3,
            });

            this.redisClient.on('connect', () => {
                this.logger.log('Successfully connected to Redis');
            });

            this.redisClient.on('error', (err) => {
                this.logger.error('Redis connection error', err);
            });
        } else {
            this.logger.warn('REDIS_URL not found. Caching will be disabled.');
        }
    }

    onModuleDestroy() {
        if (this.redisClient) {
            this.redisClient.disconnect();
        }
    }

    async get(key: string): Promise<string | null> {
        if (!this.redisClient) return null;
        return this.redisClient.get(key);
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (!this.redisClient) return;
        if (ttlSeconds) {
            await this.redisClient.set(key, value, 'EX', ttlSeconds);
        } else {
            await this.redisClient.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        if (!this.redisClient) return;
        await this.redisClient.del(key);
    }

    async delByPattern(pattern: string): Promise<void> {
        if (!this.redisClient) return;
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
            await this.redisClient.del(...keys);
        }
    }
}
