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

// Manual .env loading since @nestjs/config is missing
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath).toString();
  envConfig.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key.trim()]) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  });
  console.log('[BOOTSTRAP] Loaded .env manually');
}

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
let cachedApp: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logBufferService = app.get(LogBufferService);
  const httpAdapterHost = app.get(HttpAdapterHost);

  console.log(`[BOOTSTRAP] Starting Backend v2.2 with Fortified Security...`);

  // 1. Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP if frontend/backend are separate or tricky, but keep other protections
  }));

  // 2. Global Rate Limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
  }));

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logBufferService));
  app.setGlobalPrefix('api');

  // 3. Restricted CORS
  app.enableCors({
    origin: FRONTEND_URL === '*' ? true : FRONTEND_URL.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    credentials: true,
  });
  return app;
}

// If running directly (e.g. "npm run start")
if (require.main === module) {
  bootstrap().then(async (app) => {
    await app.listen(PORT);
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
