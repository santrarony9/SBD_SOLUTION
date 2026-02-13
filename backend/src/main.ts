import 'reflect-metadata';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LogBufferService } from './diagnostics/log-buffer.service';
import * as fs from 'fs';
import * as path from 'path';

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
let cachedApp: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logBufferService = app.get(LogBufferService);
  const httpAdapterHost = app.get(HttpAdapterHost);

  console.log(`[BOOTSTRAP] Starting Backend v2.1 with Team Routes...`);

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logBufferService));
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    credentials: false,
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
