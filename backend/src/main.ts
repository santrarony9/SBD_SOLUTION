import 'reflect-metadata';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LogBufferService } from './diagnostics/log-buffer.service';
import * as fs from 'fs';
import * as path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load environment variables immediately before any modules evaluate
import * as dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.sparkbluediamond.com,https://sparkbluediamond.com';
let cachedApp: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logBufferService = app.get(LogBufferService);
  const httpAdapterHost = app.get(HttpAdapterHost);

  console.log(
    `[BOOTSTRAP] Starting Backend v2.3 with Advanced Traffic Coordination...`,
  );

  // 1. Security Headers (Restored to stable state)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // Enable trust proxy for Nginx/Cloudflare to correctly identify client IPs
  const adapter = app.getHttpAdapter().getInstance();
  if (typeof adapter.set === 'function') {
    adapter.set('trust proxy', 1); // Trust first proxy (Nginx)
  }

  // 2. Rate Limiting Protection (Increased for Production Dashboards)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 2000, 
      message: 'Too many requests from this IP, please try again after 15 minutes',
      standardHeaders: true,
      legacyHeaders: false,
      // The validator is strict about trust proxy, but we need it for correct IP detection
      validate: { trustProxy: false }, 
    }),
  );

  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost, logBufferService),
  );
  
  // Enable global validation with whitelist to strip injected properties
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  app.setGlobalPrefix('api');

  // 3. Strict CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || FRONTEND_URL === '*' || FRONTEND_URL.split(',').includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type, Accept, Authorization, X-Requested-With, X-Client-Version, Cache-Control, Pragma',
    credentials: true,
  });
  app.enableShutdownHooks();
  return app;
}

// If running directly (e.g. "npm run start")
if (require.main === module) {
  bootstrap().then(async (app) => {
    await app.listen(PORT, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
  });
}

// Export for Vercel (Serverless Function)
export default async (req: any, res: any) => {
  if (!cachedApp) {
    const app = await bootstrap();
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp(req, res);
};
